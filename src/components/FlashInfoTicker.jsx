import { useTranslation } from 'react-i18next'

// Liste des ports/autorités déjà inscrites à la COPAF 2026 (mise à jour manuelle
// à chaque nouvelle inscription confirmée). Chaque logo doit exister dans /public.
const registeredPorts = [
  { url: '/sierraport.png', name: 'Sierra Leone Ports and Harbours Authority', country: 'Sierra Leone' },
  { url: '/portdouala.png', name: 'Port Autonome de Douala', country: 'Cameroun' },
  { url: '/portkribi.png', name: 'Port Autonome de Kribi', country: 'Cameroun' },
  { url: '/lome.png', name: 'Port Autonome de Lomé', country: 'Togo' },
]

const FlashInfoTicker = () => {
  const { t } = useTranslation()
  const items = [...registeredPorts, ...registeredPorts, ...registeredPorts]

  if (registeredPorts.length === 0) return null

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #000E91, #0073F4)',
      overflow: 'hidden',
      position: 'relative',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>

        {/* Badge "EN DIRECT" fixe à gauche */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 18px',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 3,
          position: 'relative',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#4ade80', flexShrink: 0,
            animation: 'flashPulse 1.4s infinite',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
            color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap',
            fontFamily: "'Inter', sans-serif",
          }}>
            {t('flashInfoTicker.title')}
          </span>
        </div>

        {/* Fondu de transition entre le badge et le défilement */}
        <div style={{
          position: 'absolute', left: 170, top: 0, bottom: 0, width: 30,
          background: 'linear-gradient(to right, rgba(0,14,145,0.6), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Rail défilant */}
        <div className="ticker-container" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div className="ticker-track" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            width: 'max-content',
            padding: '8px 0',
          }}>
            {items.map((p, i) => (
              <div key={i} style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  padding: 3,
                }}>
                  <img src={p.url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {p.name} <span style={{ opacity: 0.65, fontWeight: 400 }}>· {p.country}</span>
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>&bull;</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flashPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,.6); }
          50% { opacity: .6; box-shadow: 0 0 0 4px rgba(74,222,128,0); }
        }
        .ticker-track {
          animation: tickerScroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-container:hover .ticker-track {
          animation-play-state: paused;
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @media (max-width: 640px) {
          .ticker-track { animation-duration: 18s; }
        }
      `}</style>
    </div>
  )
}

export default FlashInfoTicker