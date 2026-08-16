import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { PORTS, PORTS_AUTRE } from '../utils/portsData'

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

// Identite saisie une seule fois par session d'appareil, reutilisee pour
// tous les sondages "publics" votes ensuite (evite de la redemander a
// chaque question si plusieurs sondages publics sont actifs).
function getIdentiteStockee() {
  try { return JSON.parse(localStorage.getItem('copaf_vote_identite') || 'null') || { nom: '', port: '', portAutre: '' } }
  catch { return { nom: '', port: '', portAutre: '' } }
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
  const [identite, setIdentite] = useState(getIdentiteStockee)
  const [erreurIdentite, setErreurIdentite] = useState('')
  const deviceToken = getDeviceToken()

  const loadSondagesActifs = useCallback(async () => {
    const { data: rows } = await supabase
      .from('sondages')
      .select('id, session, question, options, ordre, is_public')
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

  const voter = async (sondage, optionIndex) => {
    const sondageId = sondage.id
    if (mesVotes[sondageId] !== undefined || submitting) return

    const identiteIncomplete = !identite.nom.trim() || !identite.port || (identite.port === PORTS_AUTRE.value && !identite.portAutre.trim())
    if (sondage.is_public && identiteIncomplete) {
      setErreurIdentite(sondageId)
      return
    }
    setErreurIdentite('')

    setSubmitting(sondageId)
    const portLabel = identite.port === PORTS_AUTRE.value
      ? identite.portAutre
      : (PORTS.find(p => p.value === identite.port)?.label.fr || '')
    const { error } = await supabase.from('votes').insert([{
      sondage_id: sondageId, option_index: optionIndex, device_token: deviceToken,
      ...(sondage.is_public ? { nom: identite.nom.trim(), port: portLabel } : {}),
    }])
    setSubmitting('')
    if (!error) {
      setMesVotes(v => ({ ...v, [sondageId]: optionIndex }))
      if (sondage.is_public) localStorage.setItem('copaf_vote_identite', JSON.stringify(identite))
    }
    // Si error (ex: doublon), on ignore silencieusement — le vote existant reste valable.
  }

  const wrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '24px 16px' }
  const card = { maxWidth: 560, margin: '0 auto' }
  const inputIdentite = { width: '100%', padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }
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

        {sondages.some(s => s.is_public) && (
          <div style={{ background: '#fff', border: '1.5px solid #fde68a', borderRadius: 20, padding: 20, marginBottom: 18, boxShadow: '0 4px 20px rgba(0,14,145,.06)', animation: 'copaf-vote-in .35s ease' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#92400e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#fef3c7' }}>PUBLIC</span>
              Une question est publique — indiquez qui vous êtes
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                style={inputIdentite} placeholder="Votre nom" value={identite.nom}
                onChange={e => setIdentite(v => ({ ...v, nom: e.target.value }))}
              />
              <select
                style={inputIdentite} value={identite.port}
                onChange={e => setIdentite(v => ({ ...v, port: e.target.value }))}
              >
                <option value="">Votre port</option>
                {[...new Set(PORTS.map(p => p.country))].map(country => (
                  <optgroup key={country} label={country}>
                    {PORTS.filter(p => p.country === country).map(p => (
                      <option key={p.value} value={p.value}>{p.label.fr}</option>
                    ))}
                  </optgroup>
                ))}
                <option value={PORTS_AUTRE.value}>{PORTS_AUTRE.label.fr}</option>
              </select>
            </div>
            {identite.port === PORTS_AUTRE.value && (
              <input
                style={{ ...inputIdentite, marginTop: 10 }} placeholder="Précisez votre port / organisation"
                value={identite.portAutre} onChange={e => setIdentite(v => ({ ...v, portAutre: e.target.value }))}
              />
            )}
          </div>
        )}

        {sondages.map((s, idx) => {
          const monVote = mesVotes[s.id]
          return (
            <div key={s.id} style={{
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 22, marginBottom: 18,
              boxShadow: '0 4px 20px rgba(0,14,145,.06)', animation: `copaf-vote-in .35s ease ${idx * 0.06}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {s.session && <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.session}</div>}
                {s.is_public && <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: '#fef3c7', color: '#92400e', letterSpacing: 0.4 }}>PUBLIC</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 18, lineHeight: 1.4 }}>{s.question}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(s.options || []).map((opt, i) => {
                  const selected = monVote === i
                  const disabled = monVote !== undefined
                  return (
                    <button
                      key={i}
                      onClick={() => voter(s, i)}
                      disabled={disabled || submitting === s.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                        padding: '15px 18px', borderRadius: 14, textAlign: 'left', fontFamily: 'inherit',
                        fontSize: 15, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
                        border: `2px solid ${selected ? BLUE : '#e2e8f0'}`,
                        background: selected ? '#EBF3FF' : '#fff',
                        color: selected ? NAVY : '#334155',
                        opacity: disabled && !selected ? 0.5 : 1,
                        transform: selected ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all .2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <span>{opt}</span>
                      {selected && <Ico name="check" size={18} color={BLUE} />}
                    </button>
                  )
                })}
              </div>

              {erreurIdentite === s.id && (
                <p style={{ fontSize: 12.5, color: '#dc2626', fontWeight: 700, marginTop: 14, marginBottom: 0, textAlign: 'center' }}>
                  Merci de renseigner votre nom et votre port ci-dessus avant de voter.
                </p>
              )}

              {monVote !== undefined && (
                <p style={{ fontSize: 12.5, color: '#059669', fontWeight: 700, marginTop: 14, marginBottom: 0, textAlign: 'center', animation: 'copaf-vote-in .3s ease' }}>
                  ✓ Merci, votre réponse a été enregistrée
                </p>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes copaf-vote-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}