// src/pages/BadgeToken.jsx
//
// Page unique /badge/:token, pointee par le QR code imprime sur chaque
// badge COPAF 2026. Le contenu affiche depend de qui scanne — decide
// entierement cote serveur (fonction badge_lookup, is_admin('checkin')) :
// jamais de logique de securite cote client. Le staff scanne generalement
// depuis /staff/scan (deja connecte) ; un participant qui scanne le badge
// d'un autre arrive ici directement, sans session — il ne voit que la
// fiche publique limitee.

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Ico } from '../utils/dossierUi'

const NAVY = '#000E91'
const BLUE = '#0073F4'

export default function BadgeToken() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(undefined)
  const [error, setError] = useState('')
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinResult, setCheckinResult] = useState(null)

  const load = async () => {
    setError('')
    const { data: rows, error: err } = await supabase.rpc('badge_lookup', { p_token: token })
    if (err || !rows || rows.length === 0) {
      setError('Badge introuvable.')
      setData(null)
      return
    }
    setData(rows[0])
    setCheckinResult(null)
  }

  useEffect(() => { load() }, [token])

  const handleCheckin = async () => {
    setCheckinLoading(true)
    try {
      const { data: rows, error: err } = await supabase.rpc('badge_checkin', { p_token: token })
      if (err) { setError(err.message); return }
      setCheckinResult(rows?.[0] || null)
      await load()
    } finally {
      setCheckinLoading(false)
    }
  }

  if (data === undefined) {
    return <div style={wrapStyle}><p style={{ color: '#64748b' }}>Chargement...</p></div>
  }

  if (data === null || error) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <Ico name="alert" size={28} color="#dc2626" />
          <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, marginTop: 12 }}>{error || 'Badge introuvable.'}</p>
        </div>
      </div>
    )
  }

  // ── Vue publique (n'importe qui scanne le badge d'un autre) ──
  if (!data.is_staff) {
    return (
      <div style={wrapStyle}>
        <div style={{ ...cardStyle, background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, color: '#fff', textAlign: 'left' }}>
          <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>COPAF 2026</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 10 }}>{data.prenom} {data.nom}</div>
          {data.poste && <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>{data.poste}</div>}
          {data.organisation && <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{data.organisation}</div>}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.2)', fontSize: 11, opacity: 0.6 }}>
            Conférence des Ports Africains · 19–21 Oct. 2026, Casablanca
          </div>
        </div>
      </div>
    )
  }

  // ── Vue staff (session admin scope checkin/all deja active) ──
  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{data.categorie || 'Participant'}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{data.prenom} {data.nom}</div>
          </div>
          {data.photo_url && <img src={data.photo_url} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />}
        </div>

        {[
          { label: 'Fonction', value: data.poste },
          { label: 'Organisation', value: data.organisation },
          { label: 'Dossier', value: data.dossier },
          { label: 'Email', value: data.email },
          { label: 'Téléphone', value: data.telephone },
        ].filter(f => f.value).map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12.5 }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{f.label}</span>
            <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>{f.value}</span>
          </div>
        ))}

        <div style={{ marginTop: 20 }}>
          {data.arrived ? (
            <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: 12, padding: '14px', textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
              ✓ Déjà arrivé{data.arrived_at ? ` à ${new Date(data.arrived_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </div>
          ) : (
            <button type="button" onClick={handleCheckin} disabled={checkinLoading} style={{
              width: '100%', padding: '15px', background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: checkinLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {checkinLoading ? 'Enregistrement...' : 'Arrivé et installé'}
            </button>
          )}
          {checkinResult?.deja_arrive && (
            <p style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>Ce badge avait déjà été pointé.</p>
          )}
          <button type="button" onClick={() => navigate('/staff/scan')} style={{
            width: '100%', padding: '13px', marginTop: 10, background: '#fff',
            color: NAVY, border: `1.5px solid ${NAVY}`, borderRadius: 12, fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Ico name="search" size={14} color={NAVY} />
            Scanner le badge suivant
          </button>
        </div>
      </div>
    </div>
  )
}

const wrapStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20, background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif",
}

const cardStyle = {
  width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 12px 32px rgba(15,23,42,.12)', textAlign: 'center',
}
