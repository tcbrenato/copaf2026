import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const BAR_COLORS = ['#0073F4', '#00C8FF', '#4DA6FF', '#7BC4FF', '#A8E0FF']

export default function ResultatsSondage() {
  const { id } = useParams()
  const [sondage, setSondage] = useState(null)
  const [counts, setCounts] = useState([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    const { data: s } = await supabase
      .from('sondages')
      .select('id, session, question, options, actif')
      .eq('id', id)
      .single()
    setSondage(s)

    if (s) {
      const { data: voteRows } = await supabase
        .from('votes')
        .select('option_index')
        .eq('sondage_id', id)
      const tally = new Array((s.options || []).length).fill(0)
      ;(voteRows || []).forEach(v => { if (tally[v.option_index] !== undefined) tally[v.option_index]++ })
      setCounts(tally)
      setTotal((voteRows || []).length)
    }
  }, [id])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`resultats-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `sondage_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sondages', filter: `id=eq.${id}` }, load)
      .subscribe()
    const interval = setInterval(load, 5000)
    return () => { supabase.removeChannel(channel); clearInterval(interval) }
  }, [id, load])

  const voteUrl = typeof window !== 'undefined' ? `${window.location.origin}/vote` : ''

  const wrap = {
    minHeight: '100vh', background: `linear-gradient(135deg,${NAVY},#000733)`,
    fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '48px 64px',
    display: 'flex', flexDirection: 'column', color: '#fff',
  }

  if (!sondage) {
    return <div style={wrap}><div style={{ margin: 'auto', fontSize: 20, opacity: 0.6 }}>Chargement...</div></div>
  }

  const maxCount = Math.max(1, ...counts)

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#4DA6FF', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>
            COPAF 2026 {sondage.session ? `· ${sondage.session}` : ''}
          </div>
          <div style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, lineHeight: 1.2, maxWidth: 900 }}>{sondage.question}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 42, fontWeight: 900 }}>{total}</div>
          <div style={{ fontSize: 13, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>Réponses</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
        {(sondage.options || []).map((opt, i) => {
          const count = counts[i] || 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const widthPct = Math.round((count / maxCount) * 100)
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 18, fontWeight: 700 }}>
                <span>{opt}</span>
                <span style={{ opacity: 0.8 }}>{count} · {pct}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, height: 28, overflow: 'hidden' }}>
                <div style={{
                  width: `${widthPct}%`, height: '100%', borderRadius: 12,
                  background: BAR_COLORS[i % BAR_COLORS.length],
                  transition: 'width .5s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 40, opacity: 0.85 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Votez sur {voteUrl}</div>
        <span style={{
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
          background: sondage.actif ? 'rgba(34,197,94,.2)' : 'rgba(148,163,184,.2)',
          color: sondage.actif ? '#4ade80' : '#94a3b8',
        }}>
          {sondage.actif ? '● EN DIRECT' : 'CLÔTURÉ'}
        </span>
      </div>
    </div>
  )
}