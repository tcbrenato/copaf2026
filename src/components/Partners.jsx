import { useTranslation } from 'react-i18next'

// Les 4 seuls soutiens institutionnels reels de la conference
const partners = [
  { url: 'https://i.ibb.co/7dNZJQN5/agpaoc-0.jpg', name: 'AGPAOC' },
  { url: 'https://i.ibb.co/5WvKCqt8/logo-CRF-PERFECTION-4x-1761998753526.png', name: 'CRF Perfection' },
  { url: '/ANP.png', name: 'ANP' },
  { url: '/uapna.png', name: 'UAPNA' },
]

const Partners = () => {
  const { t } = useTranslation()
  const items = [...partners, ...partners, ...partners]

  return (
    <section id="partenaires" style={{
      padding: 'clamp(50px, 8vw, 90px) 0',
      background: '#eef2ff',
      borderTop: '1px solid rgba(0, 14, 145, 0.05)',
      borderBottom: '1px solid rgba(0, 14, 145, 0.05)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Arrière-plan réseau digital SVG */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 600"
      >
        <rect width="1440" height="600" fill="#eef2ff" />
        {[
          [80,80,320,60],[320,60,560,140],[560,140,720,60],[720,60,960,120],[960,120,1200,60],[1200,60,1380,120],
          [80,80,160,240],[160,240,320,300],[320,300,480,240],[480,240,560,140],[560,140,640,280],[640,280,800,320],
          [800,320,960,260],[960,260,1100,320],[1100,320,1260,260],[1260,260,1380,340],
          [160,240,240,400],[240,400,400,460],[400,460,560,400],[560,400,720,480],[720,480,880,400],
          [880,400,1040,480],[1040,480,1200,400],[1200,400,1380,460],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.5" />
        ))}
        {[
          [80,80],[320,60],[560,140],[720,60],[960,120],[1200,60],[1380,120],
          [160,240],[320,300],[480,240],[640,280],[800,320],[960,260],[1100,320],[1260,260],[1380,340],
          [240,400],[400,460],[560,400],[720,480],[880,400],[1040,480],[1200,400],[1380,460],
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 5 === 0 ? 5 : 3} fill={i % 7 === 0 ? '#0073F4' : '#818cf8'} opacity="0.6" />
        ))}
      </svg>

      {/* Overlay de lisibilité */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(238,242,255,0.78)',
        zIndex: 1,
      }} />

      {/* Contenu principal avec disposition latérale (Titre vertical / Slider) */}
      <div className="partners-wrapper" style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 50px)',
        gap: '40px',
      }}>
        
        {/* Titre vertical latéral */}
        <div className="partners-vertical-title" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: '220px',
          borderLeft: '3px solid #0073F4',
          paddingLeft: '16px',
        }}>
          <span style={{
            fontSize: '11px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#0073F4',
            marginBottom: '6px',
          }}>
            {t('partners.eyebrow') || 'Institutions'}
          </span>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            fontWeight: 800,
            color: '#000E91',
            margin: 0,
            lineHeight: 1.25,
          }}>
            {t('partners.title') || 'Soutiens Officiels'}
          </h2>
        </div>

        {/* Rail de défilement des logos */}
        <div className="slider-container" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
          <div className="mask-left" style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '10%',
            background: 'linear-gradient(to right, rgba(238,242,255,0.95), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div className="mask-right" style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '10%',
            background: 'linear-gradient(to left, rgba(238,242,255,0.95), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          <div className="logo-track" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            width: 'max-content',
            padding: '10px 0',
          }}>
            {items.map((p, i) => (
              <div key={i} className="logo-card" style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(140px, 16vw, 210px)',
                height: 'clamp(75px, 9vw, 100px)',
                padding: '12px 20px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0, 14, 145, 0.05)',
                border: '1px solid rgba(0, 14, 145, 0.07)',
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

      </div>

      <style>{`
        .logo-track {
          animation: scroll 35s linear infinite;
          will-change: transform;
        }
        .slider-container:hover .logo-track {
          animation-play-state: paused;
        }
        .logo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 22px rgba(0, 115, 244, 0.12) !important;
          border-color: rgba(0, 115, 244, 0.2) !important;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @media (max-width: 900px) {
          .partners-wrapper {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 20px !important;
          }
          .partners-vertical-title {
            min-width: 100% !important;
            padding-left: 12px !important;
          }
        }
        @media (max-width: 640px) {
          #partenaires { padding: 40px 0; }
          .logo-track { animation-duration: 22s; }
          .logo-card {
            width: 140px !important;
            height: 80px !important;
            padding: 10px;
          }
        }
      `}</style>
    </section>
  )
}

export default Partners