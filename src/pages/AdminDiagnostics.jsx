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

function tempsRelatif(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  return `il y a ${Math.floor(diffH / 24)} j`
}

function couleurMoyenne(v) {
  if (v < 2) return '#f87171'
  if (v < 3.5) return '#fbbf24'
  return '#4ade80'
}

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtrePays, setFiltrePays] = useState('')
  const [ouvert, setOuvert] = useState(null)
  const [nouveauId, setNouveauId] = useState(null)
  const [confirmSuppr, setConfirmSuppr] = useState(null) // id en attente de confirmation
  const [confirmSupprTout, setConfirmSupprTout] = useState(false)
  const [suppEnCours, setSuppEnCours] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    const { data: rows } = await supabase
      .from('diagnostics')
      .select('id, nom, prenom, organisation, pays, scores, recommandations, created_at')
      .order('created_at', { ascending: false })

    setDiagnostics(prev => {
      if (prev.length > 0 && rows && rows.length > 0 && rows[0].id !== prev[0]?.id) {
        setNouveauId(rows[0].id)
        setTimeout(() => setNouveauId(null), 4000)
      }
      return rows || []
    })
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

  const supprimerUn = async id => {
    setSuppEnCours(true)
    const { error } = await supabase.from('diagnostics').delete().eq('id', id)
    setSuppEnCours(false)
    setConfirmSuppr(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    setDiagnostics(list => list.filter(d => d.id !== id))
    showToast('Diagnostic supprimé')
  }

  const supprimerTout = async () => {
    setSuppEnCours(true)
    const idsASupprimer = filtres.map(d => d.id)
    const { error } = await supabase.from('diagnostics').delete().in('id', idsASupprimer)
    setSuppEnCours(false)
    setConfirmSupprTout(false)
    if (error) { showToast('Erreur : ' + error.message); return }
    setDiagnostics(list => list.filter(d => !idsASupprimer.includes(d.id)))
    showToast(`${idsASupprimer.length} diagnostic(s) supprimé(s)`)
  }

  const exporterCSV = () => {
    const cles = Object.keys(AXES_LABELS)
    const entetes = ['Organisation', 'Pays', 'Prénom', 'Nom', 'Email', 'Téléphone', ...cles.map(k => AXES_LABELS[k]), 'Score moyen', 'Date']
    const lignes = filtres.map(d => {
      const scores = cles.map(k => d.scores?.[k] ?? '')
      const moy = Object.values(d.scores || {}).length
        ? (Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length).toFixed(1)
        : ''
      return [
        d.organisation || '', d.pays || '', d.prenom || '', d.nom || '', d.email || '', d.telephone || '',
        ...scores, moy, new Date(d.created_at).toLocaleDateString('fr-FR'),
      ]
    })
    const csv = [entetes, ...lignes]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnostics-smartport-${filtrePays || 'tous'}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtres = filtrePays
    ? diagnostics.filter(d => d.pays === filtrePays)
    : diagnostics

  const paysUniques = [...new Set(diagnostics.map(d => d.pays).filter(Boolean))].sort()

  const moyennesParAxe = Object.keys(AXES_LABELS).map(key => {
    const valeurs = filtres.map(d => d.scores?.[key]).filter(v => v !== undefined)
    const moyenne = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0
    return { key, label: AXES_LABELS[key], moyenne, n: valeurs.length }
  })

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '32px 20px', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }
  const cardStyle = { background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }

  const inputStyle = {
    padding: '10px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#fff',
    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, outline: 'none',
  }

  return (
    <div style={wrap}>
      <div style={bgImage} />
      <div style={bgOverlay} />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
            COPAF 2026
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>Diagnostics Smart Port</div>
          <div style={{ fontSize: 13.5, color: '#94a3b8' }}>
            {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''} soumis
            {filtrePays && ` · filtré sur ${filtrePays} (${filtres.length})`}
          </div>
        </div>

        {toast && (
          <div style={{ background: 'rgba(74,222,128,0.15)', border: '1.5px solid rgba(74,222,128,0.4)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
            {toast}
          </div>
        )}

        {/* Parametres / actions */}
        <div style={{ ...cardStyle, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Paramètres</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={exporterCSV} disabled={filtres.length === 0} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
              background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa',
              fontSize: 12.5, fontWeight: 700, cursor: filtres.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
              opacity: filtres.length === 0 ? 0.5 : 1,
            }}>
              ⬇️ Exporter en CSV {filtrePays ? `(${filtrePays})` : '(tous)'}
            </button>

            {!confirmSupprTout ? (
              <button onClick={() => setConfirmSupprTout(true)} disabled={filtres.length === 0} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                fontSize: 12.5, fontWeight: 700, cursor: filtres.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
                opacity: filtres.length === 0 ? 0.5 : 1,
              }}>
                🗑️ Supprimer {filtrePays ? `les diagnostics de ${filtrePays}` : 'tous les diagnostics'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: 10 }}>
                <span style={{ fontSize: 12.5, color: '#fca5a5', fontWeight: 600 }}>Supprimer {filtres.length} diagnostic(s) définitivement ?</span>
                <button onClick={supprimerTout} disabled={suppEnCours} style={{ padding: '6px 14px', background: '#dc2626', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {suppEnCours ? '...' : 'Confirmer'}
                </button>
                <button onClick={() => setConfirmSupprTout(false)} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, color: '#cbd5e1', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activite en direct */}
        <div style={{ ...cardStyle, padding: 18, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'copaf-live-pulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>Activité en direct</span>
          </div>
          {diagnostics.length === 0 ? (
            <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>En attente des premières soumissions...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {diagnostics.slice(0, 5).map(d => {
                const estNouveau = d.id === nouveauId
                const moy = Object.values(d.scores || {}).length
                  ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
                  : 0
                return (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    padding: '9px 12px', borderRadius: 10, fontSize: 12.5,
                    background: estNouveau ? 'rgba(0,115,244,0.15)' : 'rgba(255,255,255,0.03)',
                    border: estNouveau ? `1.5px solid ${BLUE}` : '1px solid transparent',
                    transition: 'all .4s ease',
                  }}>
                    <span style={{ color: '#cbd5e1' }}>
                      {estNouveau && <span style={{ color: '#60a5fa', fontWeight: 800, marginRight: 6 }}>NOUVEAU ·</span>}
                      <strong style={{ color: '#fff' }}>{d.organisation || `${d.prenom} ${d.nom}`}</strong>
                      <span style={{ color: '#94a3b8' }}> · {d.pays}</span>
                    </span>
                    <span style={{ color: '#94a3b8', flexShrink: 0 }}>{moy.toFixed(1)}/5 · {tempsRelatif(d.created_at)}</span>
                  </div>
                )
              })}
            </div>
          )}
          <style>{`@keyframes copaf-live-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,.5); } 50% { opacity: .6; box-shadow: 0 0 0 5px rgba(74,222,128,0); } }`}</style>
        </div>

        {/* Filtre pays */}
        <div style={{ marginBottom: 20 }}>
          <select value={filtrePays} onChange={e => setFiltrePays(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="" style={{ background: '#0f172a' }}>Tous les pays</option>
            {paysUniques.map(p => <option key={p} value={p} style={{ background: '#0f172a' }}>{p}</option>)}
          </select>
        </div>

        {/* Moyennes agregees */}
        <div style={{ ...cardStyle, padding: 22, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Moyenne par axe {filtrePays ? `— ${filtrePays}` : '— tous les ports'}
          </div>
          {filtres.length === 0 ? (
            <p style={{ fontSize: 13, color: '#64748b' }}>Aucun diagnostic pour l'instant.</p>
          ) : moyennesParAxe.map(a => (
            <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: '#cbd5e1', width: 160, flexShrink: 0 }}>{a.label}</span>
              <div style={{ flex: 1, height: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(a.moyenne / 5) * 100}%`, height: '100%', background: couleurMoyenne(a.moyenne), borderRadius: 5 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: couleurMoyenne(a.moyenne), width: 50, textAlign: 'right', flexShrink: 0 }}>{a.moyenne.toFixed(1)}/5</span>
            </div>
          ))}
        </div>

        {/* Liste */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
          Diagnostics individuels
        </div>

        {loading && <div style={{ color: '#64748b', fontSize: 13 }}>Chargement...</div>}
        {!loading && filtres.length === 0 && <div style={{ color: '#64748b', fontSize: 13 }}>Aucun résultat.</div>}

        {filtres.map(d => {
          const isOuvert = ouvert === d.id
          const moyenne = Object.values(d.scores || {}).length
            ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length
            : 0
          return (
            <div key={d.id} style={{ ...cardStyle, padding: 16, marginBottom: 10 }}>
              <div onClick={() => setOuvert(isOuvert ? null : d.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{d.organisation || `${d.prenom} ${d.nom}`}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{d.prenom} {d.nom} · {d.pays}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: couleurMoyenne(moyenne) }}>{moyenne.toFixed(1)}/5</span>
                  <a href={`/diagnostic/resultat/${d.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11.5, color: '#60a5fa', fontWeight: 700, textDecoration: 'underline' }}>
                    Voir
                  </a>
                  {confirmSuppr === d.id ? (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => supprimerUn(d.id)} disabled={suppEnCours} style={{ padding: '5px 10px', background: '#dc2626', border: 'none', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {suppEnCours ? '...' : 'Confirmer'}
                      </button>
                      <button onClick={() => setConfirmSuppr(null)} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 7, color: '#cbd5e1', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setConfirmSuppr(d.id) }} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#f87171' }}>
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {isOuvert && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {Object.keys(AXES_LABELS).map(key => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1', padding: '4px 0' }}>
                      <span>{AXES_LABELS[key]}</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{d.scores?.[key] ?? '—'}/5</span>
                    </div>
                  ))}
                  {d.recommandations && (
                    <div style={{ marginTop: 10, padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {d.recommandations}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}