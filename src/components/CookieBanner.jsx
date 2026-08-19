import { useState, useEffect } from 'react'

const STORAGE_KEY = 'copaf_cookies_ack'
const NAVY = '#000E91'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const accepter = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 950,
      background: '#0a1128', color: '#f1f5f9', padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.25)', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif",
    }}>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, maxWidth: 760, textAlign: 'center', color: '#cbd5e1' }}>
        En poursuivant votre navigation sur ce site, vous reconnaissez avoir pris connaissance et accepté nos{' '}
        <a href="/mentions-legales" style={{ color: '#60a5fa', fontWeight: 700 }}>mentions légales</a> ainsi que notre{' '}
        <a href="/politique-confidentialite" style={{ color: '#60a5fa', fontWeight: 700 }}>politique de confidentialité et de consentement</a>.
      </p>
      <button
        onClick={accepter}
        style={{
          flexShrink: 0, padding: '11px 26px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontWeight: 800, fontSize: 13.5,
          fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(0,115,244,0.4)',
        }}
      >
        J'ai compris
      </button>
    </div>
  )
}
