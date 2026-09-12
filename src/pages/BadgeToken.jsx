// src/pages/BadgeToken.jsx
//
// Page unique /badge/:token, pointee par le QR code imprime sur chaque
// badge COPAF 2026. Le contenu affiche depend de qui scanne — decide
// entierement cote serveur (fonction badge_lookup, is_admin('checkin')) :
// jamais de logique de securite cote client. Le staff scanne generalement
// depuis /staff/scan (deja connecte) ; un participant qui scanne le badge
// d'un autre arrive ici directement, sans session — il ne voit que la
// fiche publique limitee.
//
// Vue publique : les autorites portuaires (participants) gardent une carte
// minimale (nom/fonction/organisation) — c'est deja ce qu'il faut pour
// elles. Les intervenants, eux, ont une fiche complete façon carte de
// visite numerique (photo, coordonnees, boutons de contact, vCard) : voir
// badge_lookup, qui ne masque plus email/telephone/pays/photo pour la
// categorie "Intervenant" (contrairement aux participants, restes
// reserves au staff pour le pointage).

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Ico } from '../utils/dossierUi'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// Icones locales absentes du kit partage (dossierUi) — direct/telephone,
// WhatsApp, enregistrement de contact.
const MiniIco = ({ name, size = 18, color = '#fff' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    phone: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    whatsapp: <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.01 2C6.485 2 2 6.485 2 12.01c0 1.845.507 3.577 1.386 5.061L2 22l5.05-1.345A9.96 9.96 0 0 0 12.01 22C17.535 22 22 17.535 22 12.01 22 6.485 17.535 2 12.01 2zm0 18.017a8 8 0 0 1-4.075-1.117l-.293-.174-3.024.805.81-2.947-.19-.302a7.99 7.99 0 0 1-1.238-4.272c0-4.42 3.596-8.017 8.016-8.017 4.42 0 8.016 3.596 8.016 8.017 0 4.42-3.596 8.007-8.022 8.007z"/></svg>,
    save: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  }
  return icons[name] || null
}

// Fond decoratif "neige" : le mark COPAF (cercle + boussole) disperse en
// petites touches, avec mix-blend-mode:multiply pour que le fond blanc du
// PNG source se fonde dans la page au lieu de laisser des carres visibles.
const FLOCONS = [
  { top: '4%', left: '8%', size: 46, opacity: .07, rotate: -12 },
  { top: '12%', left: '82%', size: 60, opacity: .06, rotate: 18 },
  { top: '22%', left: '35%', size: 30, opacity: .05, rotate: 6 },
  { top: '30%', left: '68%', size: 40, opacity: .08, rotate: -20 },
  { top: '40%', left: '6%', size: 34, opacity: .06, rotate: 10 },
  { top: '48%', left: '90%', size: 44, opacity: .05, rotate: -8 },
  { top: '58%', left: '20%', size: 26, opacity: .07, rotate: 25 },
  { top: '65%', left: '55%', size: 50, opacity: .05, rotate: -15 },
  { top: '74%', left: '85%', size: 32, opacity: .06, rotate: 12 },
  { top: '80%', left: '12%', size: 38, opacity: .06, rotate: -22 },
  { top: '88%', left: '65%', size: 28, opacity: .07, rotate: 8 },
  { top: '15%', left: '55%', size: 24, opacity: .05, rotate: -30 },
  { top: '92%', left: '35%', size: 42, opacity: .05, rotate: 16 },
]

function FondNeige() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {FLOCONS.map((f, i) => (
        <img
          key={i} src="/icons/icon-512.png" alt=""
          style={{
            position: 'absolute', top: f.top, left: f.left, width: f.size, height: f.size,
            opacity: f.opacity, transform: `rotate(${f.rotate}deg)`, mixBlendMode: 'multiply',
          }}
        />
      ))}
    </div>
  )
}

function telechargerVCard(data) {
  const lignes = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${data.nom || ''};${data.prenom || ''};;;`,
    `FN:${data.prenom || ''} ${data.nom || ''}`.trim(),
    data.organisation && `ORG:${data.organisation}`,
    data.poste && `TITLE:${data.poste}`,
    data.telephone && `TEL;TYPE=CELL:${data.telephone}`,
    data.email && `EMAIL:${data.email}`,
    'NOTE:COPAF 2026 — Conférence des Ports Africains',
    'END:VCARD',
  ].filter(Boolean)
  const blob = new Blob([lignes.join('\r\n')], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(data.prenom || '')}_${(data.nom || '')}.vcf`.replace(/\s+/g, '_')
  a.click()
  URL.revokeObjectURL(url)
}

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
    return <div style={wrapStyle}><FondNeige /><p style={{ color: '#64748b', position: 'relative', zIndex: 1 }}>Chargement...</p></div>
  }

  if (data === null || error) {
    return (
      <div style={wrapStyle}>
        <FondNeige />
        <div style={{ ...cardStyle, position: 'relative', zIndex: 1 }}>
          <Ico name="alert" size={28} color="#dc2626" />
          <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, marginTop: 12 }}>{error || 'Badge introuvable.'}</p>
        </div>
      </div>
    )
  }

  // ── Vue publique (n'importe qui scanne le badge d'un autre) ──
  if (!data.is_staff) {
    // Intervenants : fiche complete façon carte de visite numerique (photo,
    // coordonnees, boutons de contact) — le reste (participants, sponsors...)
    // garde la carte minimale ci-dessous, volontairement sobre.
    if (data.categorie === 'Intervenant') {
      const contacts = [
        data.telephone && { name: 'phone', href: `tel:${data.telephone}`, label: 'Appeler' },
        data.telephone && { name: 'whatsapp', href: `https://wa.me/${data.telephone.replace(/[^0-9]/g, '')}`, label: 'WhatsApp' },
        data.email && { name: 'mail', href: `mailto:${data.email}`, label: 'Email' },
      ].filter(Boolean)

      return (
        <div style={wrapStyle}>
          <FondNeige />
          <div style={{ ...cardStyle, position: 'relative', zIndex: 1, padding: 0, overflow: 'hidden', textAlign: 'left' }}>
            {data.photo_url ? (
              <img src={data.photo_url} alt="" style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ height: 100, background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }} />
            )}
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 10, color: BLUE, opacity: .9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
                Intervenant COPAF 2026
              </div>
              <div style={{ fontSize: 21, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>{data.prenom} {data.nom}</div>
              {data.poste && <div style={{ fontSize: 14, color: '#334155', fontWeight: 600, marginTop: 3 }}>{data.poste}</div>}
              {data.organisation && <div style={{ fontSize: 13, color: '#64748b', marginTop: 1 }}>{data.organisation}</div>}
              {data.pays && <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>{data.pays}</div>}

              {contacts.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  {contacts.map(c => (
                    <a key={c.name} href={c.href} target={c.name === 'whatsapp' ? '_blank' : undefined} rel="noreferrer" style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 8px', borderRadius: 14, background: '#f8fafc', border: '1px solid #eef1f8', textDecoration: 'none',
                    }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MiniIco name={c.name} size={16} color="#fff" />
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#334155' }}>{c.label}</span>
                    </a>
                  ))}
                </div>
              )}

              <button type="button" onClick={() => telechargerVCard(data)} style={{
                width: '100%', marginTop: 14, padding: '13px', border: 'none', borderRadius: 12,
                background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, color: '#fff', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <MiniIco name="save" size={15} color="#fff" />
                Enregistrer le contact
              </button>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                Conférence des Ports Africains · 19–21 Oct. 2026, Casablanca
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div style={wrapStyle}>
        <FondNeige />
        <div style={{ ...cardStyle, position: 'relative', zIndex: 1, background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, color: '#fff', textAlign: 'left' }}>
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
      <FondNeige />
      <div style={{ ...cardStyle, position: 'relative', zIndex: 1 }}>
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
          { label: 'Pays', value: data.pays },
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
  position: 'relative', overflow: 'hidden',
}

const cardStyle = {
  width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28,
  boxShadow: '0 12px 32px rgba(15,23,42,.12)', textAlign: 'center',
}
