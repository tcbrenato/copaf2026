import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

const partners = [
  { url: 'https://i.ibb.co/7dNZJQN5/agpaoc-0.jpg', name: 'AGPAOC' },
  { url: 'https://i.ibb.co/5WvKCqt8/logo-CRF-PERFECTION-4x-1761998753526.png', name: 'CRF Perfection' },
  { url: '/ANP.png', name: 'ANP' },
  { url: '/uapna.png', name: 'UAPNA' },
  { url: 'https://i.ibb.co/4nB4hykm/logo-tmpa.png', name: 'Tanger Med' },
  { url: '/beninmanutentions.png', name: 'Benin Manutention' },
  { url: '/pac.png', name: 'PAC' },
  { url: '/portdouala.png', name: 'Port Autonome de Douala' },
  { url: '/portkribi.png', name: 'Port Autonome de Kribi' },
  { url: '/sierraport.png', name: 'Sierra Leone Ports and Harbours Authority' },
]

const Partners = () => {
  const { t } = useTranslation()
  const trackRef = useRef(null)
  const items = [...partners, ...partners, ...partners]

  return (
    <section id="partenaires" style={{
      padding: 'clamp(60px, 10vw, 100px) 0',
      background: '#eef2ff',
      borderTop: '1px solid rgba(0, 14, 145, 0.05)',
      borderBottom: '1px solid rgba(0, 14, 145, 0.05)',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Arrière-plan réseau digital SVG ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 600"
      >
        <rect width="1440" height="600" fill="#eef2ff" />
        {/* Lignes de connexion */}
        {[
          [80,80,320,60],[320,60,560,140],[560,140,720,60],[720,60,960,120],[960,120,1200,60],[1200,60,1380,120],
          [80,80,160,240],[160,240,320,300],[320,300,480,240],[480,240,560,140],[560,140,640,280],[640,280,800,320],
          [800,320,960,260],[960,260,1100,320],[1100,320,1260,260],[1260,260,1380,340],
          [160,240,240,400],[240,400,400,460],[400,460,560,400],[560,400,720,480],[720,480,880,400],
          [880,400,1040,480],[1040,480,1200,400],[1200,400,1380,460],
          [320,60,240,400],[960,120,880,400],[1200,60,1200,400],
          [560,400,640,280],[720,480,720,60],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.5" />
        ))}
        {/* Nœuds */}
        {[
          [80,80],[320,60],[560,140],[720,60],[960,120],[1200,60],[1380,120],
          [160,240],[320,300],[480,240],[640,280],[800,320],[960,260],[1100,320],[1260,260],[1380,340],
          [240,400],[400,460],[560,400],[720,480],[880,400],[1040,480],[1200,400],[1380,460],
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 5 === 0 ? 5 : 3} fill={i % 7 === 0 ? '#0073F4' : '#818cf8'} opacity="0.6" />
        ))}
        {/* Grands nœuds accent */}
        {[[320,60],[720,60],[960,120],[560,140],[800,320]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="7" fill="none" stroke="#0073F4" strokeWidth="1.5" opacity="0.4" />
        ))}
      </svg>

      {/* Overlay léger pour lisibilité */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(238,242,255,0.72)',
        zIndex: 1,
      }} />

      {/* Tout le contenu au-dessus du SVG */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Titre Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'clamp(40px, 6vw, 60px)',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
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
            {t('partners.eyebrow')}
          </p>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 800,
            color: '#000E91',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {t('partners.title')}
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
          {/* Masques de dégradé latéraux */}
          <div className="mask-left" style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '15%',
            background: 'linear-gradient(to right, rgba(238,242,255,0.95), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />
          <div className="mask-right" style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '15%',
            background: 'linear-gradient(to left, rgba(238,242,255,0.95), transparent)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Rail de défilement infini */}
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
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(0, 14, 145, 0.06)',
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
          #partenaires { padding: 50px 0; }
          .logo-track { animation-duration: 25s; }
          .logo-card {
            width: 160px !important;
            height: 90px !important;
            padding: 10px 15px;
          }
          .mask-left, .mask-right { width: 10% !important; }
        }
      `}</style>
    </section>
  )
}

export default Partners