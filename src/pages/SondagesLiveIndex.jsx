import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// Page d'entree rapide pour projeter un sondage en direct, sans passer par
// l'admin. Utile en salle : on ouvre juste /sondage-live et on choisit la
// question active a afficher au public.
export default function SondagesLiveIndex() {
  const [sondages, setSondages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('sondages')
      .select('id, session, question, is_public, ordre')
      .eq('actif', true)
      .order('ordre', { ascending: true })
    setSondages(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('sondages-live-index')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sondages' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const wrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '80px 20px 40px' }
  const card = { maxWidth: 640, margin: '0 auto' }

  return (
    <div style={wrap}>
      <RetourMenu />
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Sondages actifs — à projeter</div>
          <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 8 }}>Choisissez la question à afficher en direct sur le grand écran.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>}

        {!loading && sondages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 }}>
            Aucun sondage actif pour le moment.<br />Activez-en un depuis l'admin, il apparaîtra ici automatiquement.
          </div>
        )}

        {sondages.map(s => (
          <a
            key={s.id}
            href={`/sondage-live/${s.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '18px 20px',
              marginBottom: 12, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,14,145,.05)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              {s.session && <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{s.session}</div>}
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{s.question}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {s.is_public && (
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: '#fef3c7', color: '#92400e' }}>PUBLIC</span>
              )}
              <span style={{ color: BLUE, fontWeight: 800, fontSize: 20 }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
