import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import SgGate from '../components/SgGate'
import SeoHead from '../components/SeoHead'
import SgInscriptionsMap from '../components/SgInscriptionsMap'
import { AGPAOC_UAPNA_COUNTRIES, GROUP_COLORS } from '../data/agpaocUapnaCountries'

const NAVY = '#00367F'
const BLUE = '#1798F4'

const GROUP_BY_NAME = new Map(AGPAOC_UAPNA_COUNTRIES.map((c) => [c.name_fr, c.group]))
const GROUP_LABELS = { AGPAOC: 'AGPAOC', UAPNA: 'UAPNA', DUAL: 'AGPAOC / UAPNA' }

function SuiviInscriptionsContent() {
  const [rows, setRows] = useState(null) // null = chargement
  const [error, setError] = useState('')

  useEffect(() => {
    // Selection explicite des colonnes (jamais select('*')) : la vue elle-meme
    // ne contient que ces 4 champs, mais on le rend aussi explicite ici.
    supabase
      .from('v_sg_inscriptions')
      .select('pays, nom, prenom, poste')
      .then(({ data, error: err }) => {
        if (err) { setError("Impossible de charger les données pour le moment."); return }
        setRows(data || [])
      })
  }, [])

  const byCountry = useMemo(() => {
    if (!rows) return []
    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.pays)) map.set(r.pays, [])
      map.get(r.pays).push(r)
    }
    return Array.from(map.entries())
      .map(([pays, participants]) => ({
        pays,
        group: GROUP_BY_NAME.get(pays) || null,
        participants: participants.sort((a, b) => (a.nom || '').localeCompare(b.nom || '')),
      }))
      .sort((a, b) => b.participants.length - a.participants.length || a.pays.localeCompare(b.pays))
  }, [rows])

  const totalParticipants = rows?.length ?? 0
  const totalPays = byCountry.length

  const countsByCountry = useMemo(() => {
    const m = new Map()
    byCountry.forEach((c) => m.set(c.pays, c.participants.length))
    return m
  }, [byCountry])

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif" }}>
      <SeoHead title="Suivi des inscriptions — COPAF 2026" description="Suivi des inscriptions COPAF 2026" type="website" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* En-tete institutionnel */}
      <header style={{
        background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
        padding: 'clamp(32px, 5vw, 48px) clamp(20px, 5vw, 48px)',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <img src="/logocopaf.png" alt="COPAF 2026" style={{ height: 40, marginBottom: 22 }} />
          <h1 style={{ fontSize: 'clamp(24px, 3.4vw, 34px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Suivi des inscriptions — AGPAOC / UAPNA
          </h1>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
            État d'avancement des inscriptions à la COPAF 2026, par pays membre. Document de suivi à usage du Secrétariat Général.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 48px) 80px' }}>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 18, color: '#dc2626', marginBottom: 28 }}>
            {error}
          </div>
        )}

        {rows === null && !error && (
          <p style={{ color: '#64748b', fontSize: 14 }}>Chargement…</p>
        )}

        {rows !== null && (
          <>
            {/* Totaux globaux */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20,
              marginBottom: 40,
            }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '26px 28px', border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.06)' }}>
                <div style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 900, color: NAVY, lineHeight: 1 }}>{totalParticipants}</div>
                <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Participants inscrits</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '26px 28px', border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.06)' }}>
                <div style={{ fontSize: 'clamp(30px, 4vw, 42px)', fontWeight: 900, color: BLUE, lineHeight: 1 }}>{totalPays}</div>
                <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pays représentés</div>
              </div>
            </div>

            {/* Carte d'intensite */}
            {totalParticipants > 0 && (
              <div style={{ marginBottom: 44 }}>
                <SgInscriptionsMap countsByCountry={countsByCountry} />
              </div>
            )}

            {/* Liste nominative par pays */}
            {byCountry.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14 }}>Aucune inscription enregistrée pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {byCountry.map((c) => (
                  <div key={c.pays} style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.05)',
                  }}>
                    <div style={{
                      padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#f8faff', borderBottom: '1px solid rgba(0,54,127,0.08)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a1128', margin: 0 }}>{c.pays}</h2>
                        {c.group && (
                          <span style={{
                            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                            color: '#fff', background: GROUP_COLORS[c.group], borderRadius: 100, padding: '3px 10px',
                          }}>
                            {GROUP_LABELS[c.group]}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>
                        {c.participants.length} participant{c.participants.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div>
                      {c.participants.map((p, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                          padding: '14px 24px',
                          borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0a1128' }}>
                            {p.prenom} {p.nom}
                          </span>
                          <span style={{ fontSize: 13, color: '#64748b', textAlign: 'right' }}>{p.poste || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SuiviInscriptions() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  return (
    <SgGate>
      <SuiviInscriptionsContent />
    </SgGate>
  )
}
