import { useState, useEffect, useCallback, useMemo } from 'react'
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

export default function AdminDiagnostics() {
  const [diagnostics, setDiagnostics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtrePays, setFiltrePays] = useState('')
  const [rechercheTexte, setRechercheTexte] = useState('')
  
  // Vue fractionnée : ID du diagnostic actuellement sélectionné pour affichage simultané à droite
  const [selectedId, setSelectedId] = useState(null)
  const [nouveauId, setNouveauId] = useState(null)

  // Paramètres & réglages de la vue admin
  const [settings, setSettings] = useState({
    seuilCritique: 2.5,
    autoScrollLive: true,
    modeCompact: false,
    soundAlert: true,
  })
  const [showSettingsModal, setShowSettingsModal] = useState(false)

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
      .channel('admin-diagnostics-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostics' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  // Sélection automatique du premier diagnostic par défaut si aucun n'est sélectionné
  useEffect(() => {
    if (diagnostics.length > 0 && !selectedId) {
      setSelectedId(diagnostics[0].id)
    }
  }, [diagnostics, selectedId])

  // Filtrage combiné (Pays + Recherche textuelle)
  const filtres = useMemo(() => {
    return diagnostics.filter(d => {
      const matchPays = filtrePays ? d.pays === filtrePays : true
      const texte = `${d.organisation} ${d.nom} ${d.prenom} ${d.pays}`.toLowerCase()
      const matchTexte = rechercheTexte ? texte.includes(rechercheTexte.toLowerCase()) : true
      return matchPays && matchTexte
    })
  }, [diagnostics, filtrePays, rechercheTexte])

  const paysUniques = useMemo(() => {
    return [...new Set(diagnostics.map(d => d.pays).filter(Boolean))].sort()
  }, [diagnostics])

  const moyennesParAxe = useMemo(() => {
    return Object.keys(AXES_LABELS).map(key => {
      const valeurs = filtres.map(d => d.scores?.[key]).filter(v => v !== undefined)
      const moyenne = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0
      return { key, label: AXES_LABELS[key], moyenne, n: valeurs.length }
    })
  }, [filtres])

  const selectedDiagnostic = useMemo(() => {
    return diagnostics.find(d => d.id === selectedId) || filtres[0] || null
  }, [diagnostics, selectedId, filtres])

  const exportCSV = () => {
    if (!filtres.length) return
    const headers = ['ID', 'Date', 'Organisation', 'Nom', 'Prenom', 'Pays', 'Moyenne Score']
    const rows = filtres.map(d => {
      const scoresArr = Object.values(d.scores || {})
      const moy = scoresArr.length ? (scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(2) : 0
      return [d.id, d.created_at, `"${d.organisation || ''}"`, `"${d.nom || ''}"`, `"${d.prenom || ''}"`, `"${d.pays || ''}"`, moy]
    })
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `diagnostics_smart_port_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const inputStyle = {
    padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', color: '#0f172a',
    background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none',
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f4f6f9', minHeight: '100vh' }}>
      
      {/* En-tête de la page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, background: '#fff', padding: '20px 24px', borderRadius: 16, border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,14,145,.03)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', animation: 'copaf-live-pulse 1.4s ease-in-out infinite' }} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Centre de Contrôle — Smart Port Diagnostics</h1>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {diagnostics.length} diagnostic(s) enregistrés au total · Vue fractionnée active en temps réel
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCSV} style={{ ...inputStyle, background: '#fff', color: NAVY, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${NAVY}` }}>
            📥 Exporter CSV ({filtres.length})
          </button>
          <button onClick={() => setShowSettingsModal(true)} style={{ ...inputStyle, background: NAVY, color: '#fff', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            ⚙️ Paramètres
          </button>
        </div>
      </div>

      {/* --- VUE FRACTIONNÉE (SPLIT SCREEN) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* COLONNE GAUCHE : Flux en direct, Filtres & Liste interactive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Flux d'activité en direct */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dernières Activités Live</span>
              <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Synchro active</span>
            </div>
            {diagnostics.length === 0 ? (
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0 }}>En attente de soumissions en direct...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {diagnostics.slice(0, 3).map(d => {
                  const estNouveau = d.id === nouveauId
                  const moy = Object.values(d.scores || {}).length ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length : 0
                  return (
                    <div key={d.id} onClick={() => setSelectedId(d.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '8px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                      background: estNouveau ? '#EBF3FF' : selectedId === d.id ? '#f1f5f9' : '#f8fafc',
                      border: estNouveau ? `1.5px solid ${BLUE}` : '1px solid transparent',
                      transition: 'all .3s ease',
                    }}>
                      <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {estNouveau && <span style={{ color: BLUE, fontWeight: 800, marginRight: 4 }}>NEW ·</span>}
                        <strong>{d.organisation || `${d.prenom} ${d.nom}`}</strong>
                        <span style={{ color: '#94a3b8' }}> ({d.pays})</span>
                      </span>
                      <span style={{ color: '#64748b', flexShrink: 0, fontWeight: 600 }}>{moy.toFixed(1)}/5 · {tempsRelatif(d.created_at)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Filtres et Recherche */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, display: 'flex', gap: 10 }}>
            <input 
              type="text" 
              placeholder="Rechercher par port, nom..." 
              value={rechercheTexte} 
              onChange={e => setRechercheTexte(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <select value={filtrePays} onChange={e => setFiltrePays(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', width: 160 }}>
              <option value="">Tous les pays</option>
              {paysUniques.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Moyennes agrégées par axe */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              Moyennes par axe {filtrePays ? `— ${filtrePays}` : '— Global'}
            </div>
            {filtres.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Aucune donnée pour ces filtres.</p>
            ) : moyennesParAxe.map(a => (
              <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#334155', width: 150, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</span>
                <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(a.moyenne / 5) * 100}%`, height: '100%', background: a.moyenne < settings.seuilCritique ? '#dc2626' : a.moyenne < 3.5 ? '#d97706' : '#059669', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: NAVY, width: 45, textAlign: 'right', flexShrink: 0 }}>{a.moyenne.toFixed(1)}/5</span>
              </div>
            ))}
          </div>

          {/* Liste des diagnostics filtrés */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, maxHeight: 420, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              Liste des soumissions ({filtres.length})
            </div>
            {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>Chargement...</div>}
            {!loading && filtres.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun résultat trouvé.</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtres.map(d => {
                const moyenne = Object.values(d.scores || {}).length ? Object.values(d.scores).reduce((s, v) => s + v, 0) / Object.values(d.scores).length : 0
                const isSelected = selectedId === d.id
                return (
                  <div key={d.id} onClick={() => setSelectedId(d.id)} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? '#EBF3FF' : '#f8fafc',
                    border: isSelected ? `1.5px solid ${BLUE}` : '1.5px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all .2s ease'
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{d.organisation || `${d.prenom} ${d.nom}`}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{d.pays} · {tempsRelatif(d.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: BLUE }}>
                      {moyenne.toFixed(1)}/5
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE : Vue simultanée en direct du diagnostic sélectionné */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, position: 'sticky', top: 20, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
              🔍 Inspection simultanée en direct
            </span>
            {selectedDiagnostic && (
              <a href={`/diagnostic/resultat/${selectedDiagnostic.id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: NAVY, fontWeight: 700, textDecoration: 'underline' }}>
                Ouvrir la page publique ↗
              </a>
            )}
          </div>

          {!selectedDiagnostic ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Sélectionnez un diagnostic dans la liste à gauche pour voir ses détails en direct.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>{selectedDiagnostic.organisation || 'Organisation non renseignée'}</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Contact : <strong>{selectedDiagnostic.prenom} {selectedDiagnostic.nom}</strong> — Pays : <strong>{selectedDiagnostic.pays}</strong>
                </p>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '4px 0 0 0' }}>Soumis {tempsRelatif(selectedDiagnostic.created_at)}</p>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Scores détaillés par axe :</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                {Object.keys(AXES_LABELS).map(key => {
                  const scoreVal = selectedDiagnostic.scores?.[key] ?? 0
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#475569', padding: '4px 8px', background: '#f8fafc', borderRadius: 6 }}>
                      <span>{AXES_LABELS[key]}</span>
                      <span style={{ fontWeight: 700, color: scoreVal < settings.seuilCritique ? '#dc2626' : NAVY }}>
                        {scoreVal}/5
                      </span>
                    </div>
                  )
                })}
              </div>

              {selectedDiagnostic.recommandations && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Recommandations IA générées :</div>
                  <div style={{ padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: 220, overflowY: 'auto' }}>
                    {selectedDiagnostic.recommandations}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL DE PARAMÈTRES ET RÉGLAGES --- */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 420, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', marginBottom: 16 }}>Paramètres du Tableau de Bord</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Seuil d'alerte critique des scores (/5)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="1" 
                  max="5" 
                  value={settings.seuilCritique} 
                  onChange={e => setSettings({...settings, seuilCritique: parseFloat(e.target.value) || 2.5})}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                <span style={{ fontSize: 13, color: '#334155' }}>Activer les effets visuels de nouveau flux</span>
                <input 
                  type="checkbox" 
                  checked={settings.autoScrollLive} 
                  onChange={e => setSettings({...settings, autoScrollLive: e.target.checked})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowSettingsModal(false)} style={{ ...inputStyle, background: NAVY, color: '#fff', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                Enregistrer & Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes copaf-live-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,.5); } 50% { opacity: .6; box-shadow: 0 0 0 5px rgba(34,197,94,0); } }`}</style>
    </div>
  )
}