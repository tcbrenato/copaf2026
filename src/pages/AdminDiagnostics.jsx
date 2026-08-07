import { useState, useEffect, useCallback } from 'react'
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

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtrePays, setFiltrePays] = useState('')
  const [ouvert, setOuvert] = useState(null) // id du diagnostic deplie

  const load = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('diagnostics')
      .select('id, nom, prenom, organisation, pays, scores, recommandations, created_at')
      .order('created_at', { ascending: false })
    setDiagnostics(rows || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('admin-diagnostics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostics' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const filtres = filtrePays
    ? diagnostics.filter(d => d.pays === filtrePays)
    : diagnostics

  const paysUniques = [...new Set(diagnostics.map(d => d.pays).filter(Boolean))].sort()

  const moyennesParAxe = Object.keys(AXES_LABELS).map(key => {
    const valeurs = filtres.map(d => d.scores?.[key]).filter(v => v !== undefined)
    const moyenne = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0
    return { key, label: AXES_LABELS[key], moyenne, n: valeurs.length }
  })

  const inputStyle = {
    padding: '10px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a',
    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none',
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Diagnostics Smart Port</div>
        <div style={{ fontSize: 13.5, color: '#64748b' }}>
          {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''} soumis
          {filtrePays && ` · filtré sur ${filtrePays} (${filtres.length})`}
        </div>
      </div>

      {/* Filtre pays */}
      <div style={{ marginBottom: 20 }}>
        <select value={filtrePays} onChange={e => setFiltrePays(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Tous les pays</option>
          {paysUniques.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Moyennes agregees */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 22, marginBottom: 24, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
          Moyenne par axe {filtrePays ? `— ${filtrePays}` : '— tous les ports'}
        </div>
        {filtres.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Aucun diagnostic pour l'instant.</p>
        ) : moyennesParAxe.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, color: '#334155', width: 160, flexShrink: 0 }}>{a.label}</span>
            <div style={{ flex: 1, height: 9, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${(a.moyenne / 5) * 100}%`, height: '100%', background: a.moyenne < 2 ? '#dc2626' : a.moyenne < 3.5 ? '#d97706' : '#059669', borderRadius: 5 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, width: 50, textAlign: 'right', flexShrink: 0 }}>{a.moyenne.toFixed(1)}/5</span>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        Diagnostics individuels
      </div>

      {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>Chargement...</div>}
      {!loading && filtres.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun résultat.</div>}

      {filtres.map(d => {
        const isOuvert = ouvert === d.id
        const moyenne = Object.values(d.scores || {}).length
          ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
          : 0
        return (
          <div key={d.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,14,145,.04)' }}>
            <div onClick={() => setOuvert(isOuvert ? null : d.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{d.organisation || `${d.prenom} ${d.nom}`}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{d.prenom} {d.nom} · {d.pays}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: BLUE }}>{moyenne.toFixed(1)}/5</span>
                <a href={`/diagnostic/resultat/${d.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11.5, color: NAVY, fontWeight: 700, textDecoration: 'underline' }}>
                  Voir
                </a>
              </div>
            </div>

            {isOuvert && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                {Object.keys(AXES_LABELS).map(key => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', padding: '4px 0' }}>
                    <span>{AXES_LABELS[key]}</span>
                    <span style={{ fontWeight: 700 }}>{d.scores?.[key] ?? '—'}/5</span>
                  </div>
                ))}
                {d.recommandations && (
                  <div style={{ marginTop: 10, padding: 12, background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {d.recommandations}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}