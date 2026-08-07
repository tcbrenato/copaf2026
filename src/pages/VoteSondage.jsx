import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// Jeton anonyme par appareil, genere une seule fois et stocke localement.
// Ce n'est pas un compte — juste de quoi empecher un meme appareil de
// voter plusieurs fois sur la meme question.
function getDeviceToken() {
  let token = localStorage.getItem('copaf_device_token')
  if (!token) {
    token = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem('copaf_device_token', token)
  }
  return token
}

const Ico = ({ name, size = 22, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    clock: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  }
  return icons[name] || null
}

export default function VoteSondage() {
  const [sondages, setSondages] = useState([])
  const [mesVotes, setMesVotes] = useState({}) // { sondage_id: option_index }
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState('')
  const deviceToken = getDeviceToken()

  const loadSondagesActifs = useCallback(async () => {
    const { data: rows } = await supabase
      .from('sondages')
      .select('id, session, question, options, ordre')
      .eq('actif', true)
      .order('ordre', { ascending: true })
    setSondages(rows || [])

    if (rows && rows.length > 0) {
      const ids = rows.map(r => r.id)
      const { data: mesVotesRows } = await supabase
        .from('votes')
        .select('sondage_id, option_index')
        .eq('device_token', deviceToken)
        .in('sondage_id', ids)
      const map = {}
      ;(mesVotesRows || []).forEach(v => { map[v.sondage_id] = v.option_index })
      setMesVotes(map)
    }
    setLoading(false)
  }, [deviceToken])

  useEffect(() => {
    loadSondagesActifs()

    // Rafraichissement automatique — nouvelle question activee par
    // l'admin pendant la session, la page se met a jour toute seule.
    const channel = supabase
      .channel('sondages-actifs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sondages' }, loadSondagesActifs)
      .subscribe()

    // Filet de securite : re-verifie toutes les 8s meme si le
    // realtime a un souci de connexion (frequent sur wifi de salle).
    const interval = setInterval(loadSondagesActifs, 8000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [loadSondagesActifs])

  const voter = async (sondageId, optionIndex) => {
    if (mesVotes[sondageId] !== undefined || submitting) return
    setSubmitting(sondageId)
    const { error } = await supabase.from('votes').insert([{
      sondage_id: sondageId, option_index: optionIndex, device_token: deviceToken,
    }])
    setSubmitting('')
    if (!error) setMesVotes(v => ({ ...v, [sondageId]: optionIndex }))
    // Si error (ex: doublon), on ignore silencieusement — le vote existant reste valable.
  }

  const wrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '24px 16px' }
  const card = { maxWidth: 560, margin: '0 auto' }
  const BoutonMenu = () => (
    <a href="/tablette" style={{
      position: 'fixed', top: 18, left: 18, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 16px', borderRadius: 20, background: '#fff', border: '1.5px solid #e2e8f0',
      color: '#334155', fontSize: 12.5, fontWeight: 700, textDecoration: 'none',
      fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: '0 4px 12px rgba(0,14,145,.08)',
    }}>
      ← Menu
    </a>
  )

  if (loading) {
    return <div style={wrap}><BoutonMenu /><div style={{ ...card, textAlign: 'center', paddingTop: 100, color: '#64748b' }}>Chargement...</div></div>
  }

  return (
    <div style={wrap}>
      <BoutonMenu />
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Sondage en direct</div>
        </div>

        {sondages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <Ico name="clock" size={32} color="#cbd5e1" />
            <p style={{ marginTop: 14, fontSize: 15 }}>Aucun sondage actif pour le moment.<br />Restez sur cette page, elle se mettra à jour automatiquement.</p>
          </div>
        )}

        {sondages.map(s => {
          const monVote = mesVotes[s.id]
          return (
            <div key={s.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 22, marginBottom: 18, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
              {s.session && <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.session}</div>}
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 18, lineHeight: 1.4 }}>{s.question}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(s.options || []).map((opt, i) => {
                  const selected = monVote === i
                  const disabled = monVote !== undefined
                  return (
                    <button
                      key={i}
                      onClick={() => voter(s.id, i)}
                      disabled={disabled || submitting === s.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        padding: '15px 18px', borderRadius: 14, textAlign: 'left', fontFamily: 'inherit',
                        fontSize: 15, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
                        border: `2px solid ${selected ? BLUE : '#e2e8f0'}`,
                        background: selected ? '#EBF3FF' : '#fff',
                        color: selected ? NAVY : '#334155',
                        opacity: disabled && !selected ? 0.5 : 1,
                        transition: 'all .15s',
                      }}
                    >
                      <span>{opt}</span>
                      {selected && <Ico name="check" size={18} color={BLUE} />}
                    </button>
                  )
                })}
              </div>

              {monVote !== undefined && (
                <p style={{ fontSize: 12.5, color: '#059669', fontWeight: 700, marginTop: 14, marginBottom: 0, textAlign: 'center' }}>
                  ✓ Merci, votre réponse a été enregistrée
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}