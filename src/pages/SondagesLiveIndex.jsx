import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import LangToggle from '../components/LangToggle'
import { useLang } from '../i18n/useLang'

const BLUE = '#0073F4'

const TR = {
  fr: {
    title: 'Sondages actifs - à projeter',
    intro: 'Choisissez la question à afficher en direct sur le grand écran.',
    loading: 'Chargement...',
    none: 'Aucun sondage actif pour le moment.',
    noneHint: "Activez-en un depuis l'admin, il apparaîtra ici automatiquement.",
    publicBadge: 'PUBLIC',
  },
  en: {
    title: 'Active polls - to display',
    intro: 'Choose the question to show live on the big screen.',
    loading: 'Loading...',
    none: 'No active poll at the moment.',
    noneHint: 'Activate one from the admin, it will appear here automatically.',
    publicBadge: 'PUBLIC',
  },
}

// Page d'entree rapide pour projeter un sondage en direct, sans passer par
// l'admin. Utile en salle : on ouvre juste /sondage-live et on choisit la
// question active a afficher au public.
export default function SondagesLiveIndex() {
  const t = TR[useLang()]
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
      <LangToggle />
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{t.title}</div>
          <p style={{ fontSize: 13.5, color: '#64748b', marginTop: 8 }}>{t.intro}</p>
        </div>

        {loading && <div style={{ textAlign: 'center', color: '#94a3b8' }}>{t.loading}</div>}

        {!loading && sondages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 15 }}>
            {t.none}<br />{t.noneHint}
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
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: '#fef3c7', color: '#92400e' }}>{t.publicBadge}</span>
              )}
              <span style={{ color: BLUE, fontWeight: 800, fontSize: 20 }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
