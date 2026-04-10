import { useRef } from 'react'

const partners = [
  { url: 'https://i.ibb.co/7dNZJQN5/agpaoc-0.jpg', name: 'AGPAOC' },
  { url: 'https://i.ibb.co/pBtnm4xV/npa2.webp', name: 'NPA' },
  { url: 'https://i.ibb.co/6cM7Mq8L/images.jpg', name: 'Partenaire 3' },
  { url: 'https://i.ibb.co/d4vkQYmc/logopaa.gif', name: 'PAA' },
  { url: 'https://i.ibb.co/d9rmN8v/images.png', name: 'Partenaire 5' },
  { url: 'https://i.ibb.co/4nB4hykm/logo-tmpa.png', name: 'TMPA' },
  { url: 'https://i.ibb.co/5WvKCqt8/logo-CRF-PERFECTION-4x-1761998753526.png', name: 'CRF Perfection' },
]

const Partners = () => {
  const trackRef = useRef(null)
  // On triple les items pour assurer une boucle infinie sans saut visuel
  const items = [...partners, ...partners, ...partners]

  return (
    <section id="partenaires" style={{
      padding: 'clamp(60px, 10vw, 100px) 0',
      background: '#F4F7FF', // Fond subtilement bleuté pour différencier les sections
      borderTop: '1px solid rgba(0, 14, 145, 0.05)',
      borderBottom: '1px solid rgba(0, 14, 145, 0.05)',
      overflow: 'hidden',
    }}>

      {/* Titre Section - Centrage forcé pour mobile et desktop */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 'clamp(40px, 6vw, 60px)', 
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <p style={{
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#0073F4',
          marginBottom: '12px',
        }}>
          Partenariats Stratégiques
        </p>
        <h2 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(24px, 5vw, 36px)',
          fontWeight: 800,
          color: '#000E91',
          margin: 0,
          lineHeight: 1.2
        }}>
          Ils soutiennent la COPAF 2026
        </h2>
        <div style={{
          width: '50px',
          height: '4px',
          background: 'linear-gradient(90deg, #0073F4, #000E91)',
          borderRadius: '2px',
          margin: '20px auto 0',
        }} />
      </div>

      <div className="slider-container" style={{ position: 'relative', width: '100%' }}>
        {/* Masques de dégradé latéraux pour l'effet de fondu sur le fond #F4F7FF */}
        <div className="mask-left" style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%',
          background: 'linear-gradient(to right, #F4F7FF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div className="mask-right" style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%',
          background: 'linear-gradient(to left, #F4F7FF, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Le Rail de défilement infini */}
        <div className="logo-track" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(30px, 4vw, 50px)',
          width: 'max-content',
          padding: '20px 0',
        }}>
          {items.map((p, i) => (
            <div key={i} className="logo-card" style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'clamp(150px, 20vw, 240px)',
              height: 'clamp(80px, 10vw, 110px)',
              padding: '15px 25px',
              borderRadius: '16px',
              background: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 14, 145, 0.04)',
              border: '1px solid rgba(0, 14, 145, 0.06)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}>
              <img
                src={p.url}
                alt={p.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .logo-track {
          animation: scroll 40s linear infinite;
          will-change: transform;
        }

        .slider-container:hover .logo-track {
          animation-play-state: paused;
        }

        .logo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 115, 244, 0.12) !important;
          border-color: rgba(0, 115, 244, 0.2) !important;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }

        @media (max-width: 640px) {
          #partenaires {
            padding: 50px 0;
          }
          .logo-track { 
            animation-duration: 25s; /* Un peu plus rapide sur mobile pour dynamiser */
          }
          .logo-card { 
            width: 160px !important;
            height: 90px !important;
            padding: 10px 15px;
          }
          .mask-left, .mask-right {
            width: 10% !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Partners