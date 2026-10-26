import { useState, useEffect } from 'react'
import { useLang } from '../i18n/useLang'

const NAVY = '#000E91'
const BLUE = '#0073F4'
const STORAGE_KEY = 'copaf_promo_popup_seen_v2_merci'
const DELAY_MS = 4000

// Popup promotionnel plein ecran, affiche UNE SEULE FOIS par visiteur (memorise
// via localStorage) apres un court delai — jamais en boucle, ce qui agacerait
// les visiteurs plutot que de convertir. Voir DELAY_MS pour le delai avant
// premiere apparition.
export default function PromoPopup() {
  const lang = useLang()
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
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10000,
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
          aria-label={lang === 'en' ? 'Close' : 'Fermer'}
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

        {/* Apres la conference : le flyer d'inscription est remplace par un remerciement qui renvoie vers la lettre du DG */}
        <div style={{ background: 'url(/merci/fond.jpg) center/cover, #001E4E', color: '#fff', textAlign: 'center', padding: '34px 26px 30px', position: 'relative' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(180deg, rgba(5,67,152,.5), rgba(0,21,57,.85))' }} />
          <div style={{ position: 'relative' }}>
            <img src="/merci/copaf-blanc.png" alt="COPAF" width="200" height="75" style={{ height: 52, width: 'auto' }} />
            <div style={{ marginTop: 18, fontWeight: 700, fontSize: 11, letterSpacing: '.2em', color: '#A9C8F0' }}>COPAF 2026 · 19 – 21 {lang === 'en' ? 'OCTOBER' : 'OCTOBRE'}</div>
            <div style={{ margin: '10px 0 0', fontWeight: 800, fontSize: 38, lineHeight: 1.1 }}>
              {lang === 'en' ? 'THANK YOU ' : 'MERCI '}<span style={{ color: '#1798F4' }}>{lang === 'en' ? 'ALL' : 'À TOUS'}</span>
            </div>
            <p style={{ margin: '14px 0 22px', fontSize: 14.5, lineHeight: 1.6, color: '#E8F3FD' }}>
              {lang === 'en'
                ? 'Thank you to everyone who made the African Ports Conference a success.'
                : 'Merci à toutes celles et ceux qui ont fait de la Conférence des Ports Africains un succès.'}
            </p>
            <a
              href="#merci"
              onClick={close}
              style={{ display: 'inline-block', padding: '13px 26px', borderRadius: 12, background: 'linear-gradient(135deg, #1798F4, #0A5BB5)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(23,152,244,.45)' }}
            >
              {lang === 'en' ? 'Read the Director General’s letter' : 'Lire la lettre du Directeur Général'}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes promoFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes promoPopIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  )
}
