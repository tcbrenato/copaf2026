import { useEffect, useRef } from 'react'

const partners = [
  { url: 'https://i.ibb.co/7dNZJQN5/agpaoc-0.jpg', name: 'Partenaire 1' },
  { url: 'https://i.ibb.co/pBtnm4xV/npa2.webp', name: 'Partenaire 2' },
  { url: 'https://i.ibb.co/6cM7Mq8L/images.jpg', name: 'Partenaire 3' },
  { url: 'https://i.ibb.co/d4vkQYmc/logopaa.gif', name: 'Partenaire 4' },
  { url: 'https://i.ibb.co/d9rmN8v/images.png', name: 'Partenaire 5' },
  { url: 'https://i.ibb.co/5WvKCqt8/logo-CRF-PERFECTION-4x-1761998753526.png', name: 'Partenaire 6' },
]

const Partners = () => {
  const trackRef = useRef(null)

  // On duplique les logos pour boucle infinie
  const items = [...partners, ...partners]

  return (
    <section id="partenaires" style={{
      padding: 'clamp(48px, 8vw, 80px) 0',
      background: '#FFFFFF',
      borderTop: '1px solid rgba(0,14,145,0.08)',
      borderBottom: '1px solid rgba(0,14,145,0.08)',
      overflow: 'hidden',
    }}>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 5vw, 48px)', padding: '0 24px' }}>
        <div style={{
          fontSize: 11, fontFamily: 'Roboto, sans-serif',
          fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase', color: '#0073f4', marginBottom: 10,
        }}>
          Ils nous font confiance
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(26px, 4vw, 40px)',
          fontWeight: 700, color: '#000e91', margin: 0,
        }}>
          Nos Partenaires
        </h2>
        {/* Ligne décorative */}
        <div style={{
          width: 48, height: 3,
          background: 'linear-gradient(90deg, #0073f4, #000e91)',
          borderRadius: 2, margin: '14px auto 0',
        }} />
      </div>

      {/* Slider wrapper avec dégradés sur les bords */}
      <div style={{ position: 'relative' }}>

        {/* Dégradé gauche */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to right, #FFFFFF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Dégradé droite */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 120,
          background: 'linear-gradient(to left, #FFFFFF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Track animé */}
        <div ref={trackRef} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(32px, 5vw, 64px)',
          animation: 'slideLogos 22s linear infinite',
          width: 'max-content',
          padding: '8px 0',
        }}>
          {items.map((p, i) => (
            <div key={i} style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 'clamp(100px, 14vw, 160px)',
              height: 'clamp(56px, 8vw, 80px)',
              padding: '10px 16px',
              borderRadius: 10,
              background: '#FFFFFF',
              boxShadow: '0 2px 16px rgba(0,14,145,0.08)',
              border: '1px solid rgba(0,14,145,0.07)',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,115,244,0.18)'
                e.currentTarget.style.border = '1px solid rgba(0,115,244,0.25)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,14,145,0.08)'
                e.currentTarget.style.border = '1px solid rgba(0,14,145,0.07)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <img
                src={p.url}
                alt={p.name}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain', filter: 'grayscale(20%)',
                  transition: 'filter 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(20%)'}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideLogos {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 640px) {
          #partenaires { padding: 40px 0; }
        }
      `}</style>
    </section>
  )
}

export default Partners