import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const Ico = ({ name, size = 26, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    radar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>,
    poll: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    monitor: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    users: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    handshake: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-4 4-4-4 4-4"/><path d="M18 12l4 4-4 4-4-4"/><path d="M7 17l4-4 3-3 3 3"/></svg>,
    mail: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  }
  return icons[name] || null
}

const TUILES = [
  { titre: 'Diagnostic Smart Port', sousTitre: 'Évaluez la maturité digitale de votre port', href: '/diagnostic', icone: 'radar', accent: true },
  { titre: 'Sondage en direct', sousTitre: 'Votez en temps réel pendant les sessions', href: '/vote', icone: 'poll', accent: true },
  { titre: 'Programme', sousTitre: 'Le déroulé complet des 3 jours', href: '/#programme', icone: 'calendar' },
  { titre: 'Exposition digitale', sousTitre: 'Découvrez les solutions présentées', href: '/exposition-digitale', icone: 'monitor' },
  { titre: 'Intervenants', sousTitre: 'Qui parle, et à quel moment', href: '/#intervenants', icone: 'users' },
  { titre: 'Partenaires', sousTitre: 'Ils soutiennent la COPAF 2026', href: '/partenariats', icone: 'handshake' },
  { titre: 'Contact', sousTitre: 'Une question ? Écrivez-nous', href: '/#contact', icone: 'mail' },
]

export default function TabletteHub() {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/tablette` : 'https://copaf-ports.com/tablette'
    QRCode.toDataURL(url, { margin: 1, width: 200, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [])

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }

  return (
    <div style={wrap}>
      <div style={bgImage} />
      <div style={bgOverlay} />

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            COPAF 2026
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Bienvenue à la Conférence des Ports Africains
          </div>
          <p style={{ fontSize: 14.5, color: '#94a3b8' }}>
            Touchez une tuile pour accéder à l'outil ou à la section souhaitée.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {TUILES.map(t => (
            <a
              key={t.href}
              href={t.href}
              style={{
                display: 'flex', flexDirection: 'column', gap: 14, padding: '26px 22px',
                borderRadius: 20, textDecoration: 'none', cursor: 'pointer',
                background: t.accent ? 'linear-gradient(135deg, rgba(0,115,244,0.22), rgba(0,14,145,0.35))' : 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(12px)',
                border: t.accent ? '1px solid rgba(0,115,244,0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: t.accent ? '0 10px 30px rgba(0,115,244,0.25)' : '0 10px 30px rgba(0,0,0,0.5)',
                minHeight: 150,
                transition: 'transform .15s',
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: t.accent ? 'linear-gradient(135deg,#0073F4,#000E91)' : 'rgba(96,165,250,0.15)',
                border: t.accent ? 'none' : '1px solid rgba(96,165,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico name={t.icone} size={26} color={t.accent ? '#fff' : '#60a5fa'} />
              </div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.titre}</div>
                <div style={{ fontSize: 12.5, color: t.accent ? 'rgba(255,255,255,0.8)' : '#94a3b8', lineHeight: 1.4 }}>{t.sousTitre}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 20, maxWidth: 440, margin: '0 auto',
        }}>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR code" style={{ width: 84, height: 84, borderRadius: 8, flexShrink: 0 }} />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Ico name="globe" size={14} color="#60a5fa" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>copaf-ports.com/tablette</span>
            </div>
            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Scannez pour ouvrir cette page sur votre propre téléphone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}