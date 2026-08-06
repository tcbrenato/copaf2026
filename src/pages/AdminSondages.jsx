import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    plus:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
    eye:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    external: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  }
  return icons[name] || null
}

const newOptionRow = () => ({ _id: Math.random().toString(36).slice(2, 8), texte: '' })

export default function AdminSondages() {
  const [sondages, setSondages] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const [session, setSession] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([newOptionRow(), newOptionRow()])
  const [saving, setSaving] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('sondages')
      .select('id, session, question, options, actif, ordre, created_at')
      .order('created_at', { ascending: false })
    setSondages(rows || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-sondages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sondages' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const addOptionRow = () => setOptions(o => [...o, newOptionRow()])
  const removeOptionRow = id => setOptions(o => o.filter(r => r._id !== id))
  const updateOptionRow = (id, val) => setOptions(o => o.map(r => (r._id === id ? { ...r, texte: val } : r)))

  const handleCreate = async () => {
    const opts = options.map(o => o.texte.trim()).filter(Boolean)
    if (!question.trim()) { showToast('Indiquez la question'); return }
    if (opts.length < 2) { showToast('Ajoutez au moins 2 options'); return }

    setSaving(true)
    const { error } = await supabase.from('sondages').insert([{
      session: session.trim() || null,
      question: question.trim(),
      options: opts,
      actif: false,
      ordre: sondages.length,
    }])
    setSaving(false)
    if (error) { showToast('Erreur : ' + error.message); return }

    setSession(''); setQuestion(''); setOptions([newOptionRow(), newOptionRow()])
    showToast('Sondage créé')
    load()
  }

  const toggleActif = async (id, actif) => {
    await supabase.from('sondages').update({ actif: !actif }).eq('id', id)
    load()
  }

  const handleDelete = async id => {
    await supabase.from('sondages').delete().eq('id', id)
    load()
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
    color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }
  const actionBtn = (bg, color, border) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
    background: bg, border: `1.5px solid ${border}`, borderRadius: 10, color,
    fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
  })

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Sondages en direct</div>
          <div style={{ fontSize: 13.5, color: '#64748b' }}>Créez vos questions, activez-les en salle. Plusieurs sondages peuvent être actifs en même temps.</div>
        </div>
        <a href="/vote" target="_blank" rel="noopener noreferrer" style={{ ...actionBtn('#EBF3FF', NAVY, '#bfdbfe'), textDecoration: 'none' }}>
          <Ico name="external" size={14} color={NAVY} />
          Ouvrir /vote
        </a>
      </div>

      {toast && (
        <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#065f46', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Creation */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Nouveau sondage</div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Session (repère interne, optionnel)</label>
          <input style={inputStyle} placeholder="Ex : Jour 1 - Diagnostic maturité digitale" value={session} onChange={e => setSession(e.target.value)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Question</label>
          <input style={inputStyle} placeholder="Ex : Où en êtes-vous sur la digitalisation ?" value={question} onChange={e => setQuestion(e.target.value)} />
        </div>

        <label style={labelStyle}>Options de réponse</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {options.map((o, i) => (
            <div key={o._id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={inputStyle}
                placeholder={`Option ${i + 1}`}
                value={o.texte}
                onChange={e => updateOptionRow(o._id, e.target.value)}
              />
              {options.length > 2 && (
                <button onClick={() => removeOptionRow(o._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                  <Ico name="trash" size={15} color="#dc2626" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={addOptionRow} style={actionBtn('#f1f5f9', '#334155', '#e2e8f0')}>
            <Ico name="plus" size={14} color="#334155" />
            Ajouter une option
          </button>
          <button onClick={handleCreate} disabled={saving} style={actionBtn(BLUE, '#fff', BLUE)}>
            {saving ? 'Création...' : 'Créer le sondage'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        Tous les sondages {!loading && `(${sondages.length})`}
      </div>

      {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>Chargement...</div>}

      {!loading && sondages.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun sondage créé pour l'instant.</div>
      )}

      {sondages.map(s => (
        <div key={s.id} style={{
          background: '#fff', border: `1.5px solid ${s.actif ? BLUE : '#e2e8f0'}`, borderRadius: 14,
          padding: 16, marginBottom: 10, boxShadow: s.actif ? '0 4px 20px rgba(0,115,244,.12)' : '0 2px 8px rgba(0,14,145,.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {s.session && <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{s.session}</div>}
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{s.question}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(s.options || []).map((opt, i) => (
                  <span key={i} style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: '#475569' }}>{opt}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <a href={`/sondage-live/${s.id}`} target="_blank" rel="noopener noreferrer" title="Voir les résultats en direct (à projeter)" style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
                <Ico name="eye" size={15} color="#334155" />
              </a>
              <button onClick={() => toggleActif(s.id, s.actif)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', border: `1.5px solid ${s.actif ? BLUE : '#e2e8f0'}`,
                background: s.actif ? '#EBF3FF' : '#fff', color: s.actif ? BLUE : '#64748b',
              }}>
                {s.actif ? '● Actif' : 'Inactif'}
              </button>
              <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
                <Ico name="trash" size={15} color="#dc2626" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}