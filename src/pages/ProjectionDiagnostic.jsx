import { useState, useEffect, useRef, useCallback } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import { AXES, txt } from '../utils/diagnosticAxes'
import { RESEAUX } from '../utils/diagnosticOrganisations'

const BLUE = '#0073F4'

// Ecran de projection (phase 4) : affichage plein ecran, sans interaction,
// destine a etre projete en salle de conference. Ne montre jamais de donnee
// nominative — uniquement des moyennes agregees par axe (memes RPC
// SECURITY DEFINER que le reste du diagnostic collaboratif) et un compteur
// de participants actifs. Alterne automatiquement entre la vue globale et
// chaque reseau regional qui a deja des soumissions.

const TR = {
  fr: {
    badge: 'COPAF 2026 · DIAGNOSTIC SMART PORT',
    titre: 'Vue collective en direct',
    sousTitre: "Moyenne des diagnostics soumis pendant la conférence — aucune donnée individuelle n'est affichée.",
    tousPorts: 'Tous les ports',
    scoreMoyen: 'Score moyen',
    surCinq: '/ 5',
    diagnosticsSoumis: 'Diagnostics soumis',
    enLigne: 'En train de répondre',
    attenteTitre: 'En attente des premières réponses',
    attenteTexte: 'Les diagnostics soumis pour cette vue apparaîtront ici en direct.',
    direct: 'EN DIRECT',
  },
  en: {
    badge: 'COPAF 2026 · SMART PORT DIAGNOSTIC',
    titre: 'Live collective view',
    sousTitre: 'Average of diagnostics submitted during the conference — no individual data is shown.',
    tousPorts: 'All ports',
    scoreMoyen: 'Average score',
    surCinq: '/ 5',
    diagnosticsSoumis: 'Diagnostics submitted',
    enLigne: 'Currently answering',
    attenteTitre: 'Waiting for the first responses',
    attenteTexte: 'Diagnostics submitted for this view will appear here live.',
    direct: 'LIVE',
  },
}

const VUE_IDS = ['global', 'agpaoc', 'pmaesa', 'uapna', 'associe']
const ROTATION_MS = 14000

function labelVue(id, lang) {
  if (id === 'global') return TR[lang].tousPorts
  return txt(RESEAUX[id], lang)
}

function couleurScore(v) {
  if (v < 2) return '#ef4444'
  if (v < 3.5) return '#f59e0b'
  return '#22c55e'
}

export default function ProjectionDiagnostic() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]

  const [aggregates, setAggregates] = useState({})
  const [participantsCount, setParticipantsCount] = useState(0)
  const [vueIndex, setVueIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const channelRef = useRef(null)

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(VUE_IDS.map(async id => {
      const { data } = await supabase.rpc('get_diagnostic_global_aggregate', { p_reseau: id === 'global' ? null : id })
      if (!data || data.length === 0) return [id, null]
      const moyennes = {}
      let nb = 0
      data.forEach(row => { moyennes[row.axis_id] = Number(row.moyenne); nb = Math.max(nb, Number(row.nb_reponses)) })
      return [id, { moyennes, nb }]
    }))
    setAggregates(Object.fromEntries(results))
  }, [])

  useEffect(() => {
    fetchAll()

    const channel = supabase.channel('diagnostic-projection')
    channelRef.current = channel
    channel
      .on('presence', { event: 'sync' }, () => {
        setParticipantsCount(Object.keys(channel.presenceState()).length)
      })
      .on('broadcast', { event: 'nouvelle-reponse' }, () => fetchAll())
      .subscribe()

    const poll = setInterval(fetchAll, 30000)
    return () => {
      clearInterval(poll)
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const vuesActives = VUE_IDS.filter(id => id === 'global' || aggregates[id]?.nb > 0)

  useEffect(() => {
    if (vuesActives.length <= 1) return undefined
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setVueIndex(i => (i + 1) % vuesActives.length)
        setVisible(true)
      }, 400)
    }, ROTATION_MS)
    return () => clearInterval(id)
  }, [vuesActives.length])

  const vueActuelle = vuesActives[vueIndex % vuesActives.length] || 'global'
  const agg = aggregates[vueActuelle]

  const data = AXES.map(axe => ({ axis: txt(axe.nom, lang), valeur: agg?.moyennes?.[axe.id] ?? 0, fullMark: 5 }))
  const valeurs = agg ? Object.values(agg.moyennes) : []
  const scoreGlobal = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0

  const wrap = { height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#f8fafc', display: 'flex', flexDirection: 'column' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -3, backgroundColor: '#0b0f1c', backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.6) saturate(1.25)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.6) 0%, rgba(6,9,18,0.9) 75%)' }
  const bgGlow = { position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', zIndex: -1, background: `radial-gradient(circle, ${BLUE}22 0%, transparent 65%)`, pointerEvents: 'none' }

  const card = { background: 'rgba(15, 23, 42, 0.68)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }

  return (
    <div style={wrap}>
      <div style={bgImage} /><div style={bgOverlay} /><div style={bgGlow} />
      <RetourMenu />

      <button onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')} type="button" style={{
        position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 100, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        {lang === 'fr' ? 'EN · Français' : 'FR · English'}
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', gap: 28, maxWidth: 1500, margin: '0 auto', width: '100%' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.4)', borderRadius: 20, fontSize: 12.5, fontWeight: 800, color: '#60a5fa', letterSpacing: 1.5, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'copaf-proj-pulse 1.4s ease-in-out infinite' }} />
            {t.badge} · {t.direct}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{t.titre}</h1>
          <p style={{ fontSize: 'clamp(13px, 1.1vw, 16px)', color: '#94a3b8', margin: '10px 0 0', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>{t.sousTitre}</p>
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity .4s ease, transform .4s ease', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, fontSize: 'clamp(14px, 1.3vw, 18px)', fontWeight: 800 }}>
              {labelVue(vueActuelle, lang)}
            </div>
          </div>

          {!agg ? (
            <div style={{ ...card, padding: '60px 40px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t.attenteTitre}</div>
              <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0 }}>{t.attenteTexte}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>

              <div style={{ ...card, padding: '20px 10px', flex: '1 1 560px', maxWidth: 640 }}>
                <div style={{ width: '100%', height: 'clamp(320px, 40vh, 480px)' }}>
                  <ResponsiveContainer>
                    <RadarChart data={data} outerRadius="72%">
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.4} strokeWidth={2.5} isAnimationActive animationDuration={600} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: '1 1 380px', maxWidth: 440 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ ...card, padding: '18px 20px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(30px, 3.2vw, 42px)', fontWeight: 900, color: couleurScore(scoreGlobal), lineHeight: 1 }}>{scoreGlobal.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t.scoreMoyen} {t.surCinq}</div>
                  </div>
                  <div style={{ ...card, padding: '18px 20px', flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(30px, 3.2vw, 42px)', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{agg.nb}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t.diagnosticsSoumis}</div>
                  </div>
                </div>

                <div style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'copaf-proj-pulse 1.4s ease-in-out infinite' }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{participantsCount}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t.enLigne}</div>
                  </div>
                </div>

                <div style={{ ...card, padding: '18px 20px', flex: 1 }}>
                  {AXES.map(axe => {
                    const v = agg.moyennes[axe.id] ?? 0
                    return (
                      <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 11.5, color: '#cbd5e1', width: 150, flexShrink: 0, lineHeight: 1.25 }}>{txt(axe.nom, lang)}</span>
                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: couleurScore(v), borderRadius: 5, transition: 'width .5s ease' }} />
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: couleurScore(v), width: 34, textAlign: 'right', flexShrink: 0 }}>{v.toFixed(1)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {vuesActives.length > 1 && (
          <div style={{ display: 'flex', gap: 8 }}>
            {vuesActives.map((id, i) => (
              <span key={id} style={{ width: i === vueIndex ? 22 : 7, height: 7, borderRadius: 4, background: i === vueIndex ? '#60a5fa' : 'rgba(255,255,255,0.25)', transition: 'all .4s ease' }} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes copaf-proj-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,.5); } 50% { opacity: .6; box-shadow: 0 0 0 6px rgba(34,197,94,0); } }`}</style>
    </div>
  )
}
