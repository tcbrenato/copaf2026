import { useEffect, useRef } from 'react'

const partners = [
  { url: 'https://i.ibb.co/7dNZJQN5/agpaoc-0.jpg', name: 'Partenaire 1' },
  { url: 'https://i.ibb.co/pBtnm4xV/npa2.webp', name: 'Partenaire 2' },
  { url: 'https://i.ibb.co/6cM7Mq8L/images.jpg', name: 'Partenaire 3' },
  { url: 'https://i.ibb.co/d4vkQYmc/logopaa.gif', name: 'Partenaire 4' },
  { url: 'https://i.ibb.co/d9rmN8v/images.png', name: 'Partenaire 5' },
  { url: 'https://i.ibb.co/4nB4hykm/logo-tmpa.png', name: 'Partenaire 6' },
  { url: 'https://i.ibb.co/5WvKCqt8/logo-CRF-PERFECTION-4x-1761998753526.png', name: 'Partenaire 6' },
]

const Partners = () => {
  const trackRef = useRef(null)
  const items = [...partners, ...partners]

  return (
    <section id="partenaires" style={{
      padding: 'clamp(60px, 10vw, 100px) 0', // Padding section augmenté
      background: '#FFFFFF',
      borderTop: '1px solid rgba(0,14,145,0.08)',
      borderBottom: '1px solid rgba(0,14,145,0.08)',
      overflow: 'hidden',
    }}>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)', padding: '0 24px' }}>
        <div style={{
          fontSize: 12, fontFamily: 'Roboto, sans-serif',
          fontWeight: 700, letterSpacing: 3,
          textTransform: 'uppercase', color: '#0073f4', marginBottom: 10,
        }}>
          Ils nous font confiance
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 700, color: '#000e91', margin: 0,
        }}>
          Nos Partenaires
        </h2>
        <div style={{
          width: 60, height: 4,
          background: 'linear-gradient(90deg, #0073f4, #000e91)',
          borderRadius: 2, margin: '18px auto 0',
        }} />
      </div>

      <div style={{ position: 'relative' }}>
        {/* Dégradés latéraux plus larges pour les gros logos */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 150,
          background: 'linear-gradient(to right, #FFFFFF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 150,
          background: 'linear-gradient(to left, #FFFFFF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Track animé - Temps passé de 22s à 30s pour un défilement plus doux */}
        <div ref={trackRef} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(40px, 6vw, 80px)', 
          animation: 'slideLogos 30s linear infinite', 
          width: 'max-content',
          padding: '20px 0',
        }}>
          {items.map((p, i) => (
            <div key={i} style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // DIMENSIONS AUGMENTÉES ICI :
              width: 'clamp(140px, 20vw, 220px)', 
              height: 'clamp(80px, 12vw, 110px)',
              padding: '12px 20px',
              borderRadius: 12,
              background: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0,14,145,0.06)',
              border: '1px solid rgba(0,14,145,0.07)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,115,244,0.15)'
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,14,145,0.06)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
              }}
            >
              <img
                src={p.url}
                alt={p.name}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain',
                }}
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
          #partenaires { padding: 50px 0; }
        }
      `}</style>
    </section>
  )
}

export default Partners