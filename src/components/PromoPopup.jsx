import { useState, useEffect } from 'react'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const STORAGE_KEY = 'copaf_promo_popup_seen_v1'
const DELAY_MS = 4000

// Popup promotionnel plein ecran, affiche UNE SEULE FOIS par visiteur (memorise
// via localStorage) apres un court delai — jamais en boucle, ce qui agacerait
// les visiteurs plutot que de convertir. Voir DELAY_MS pour le delai avant
// premiere apparition.
export default function PromoPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let alreadySeen = false
    try {
      alreadySeen = window.localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      // localStorage indisponible (navigation privee, etc.) — on affiche quand meme
    }
    if (alreadySeen) return

    const timer = setTimeout(() => setVisible(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  const close = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // tant pis, elle pourra se redeclencher a la prochaine visite
    }
  }

  useEffect(() => {
    if (!visible) return
    const onKey = e => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])

  if (!visible) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0, 14, 145, 0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'promoFadeIn 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 440,
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,14,145,0.4)',
          animation: 'promoPopIn 0.35s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <button
          onClick={close}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 1,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>

        <a href="/inscription" onClick={close} style={{ display: 'block', lineHeight: 0 }}>
          <img
            src="/popup-flyer.png"
            alt="COPAF 2026 — 19, 20 & 21 Octobre, Port de Casablanca"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </a>
      </div>

      <style>{`
        @keyframes promoFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes promoPopIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
