import { useTranslation } from 'react-i18next'

const FlashInfoTicker = () => {
  const { t } = useTranslation()
  
  const rawPorts = t('flashInfoTicker.ports', { returnObjects: true })
  const registeredPorts = Array.isArray(rawPorts) ? rawPorts : []

  if (registeredPorts.length === 0) return null

  // On duplique 3 fois pour assurer une boucle fluide sans saccade
  const items = [...registeredPorts, ...registeredPorts, ...registeredPorts]

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #000E91, #0073F4)',
      overflow: 'hidden',
      position: 'relative',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>

        {/* Badge "EN DIRECT" fixe à gauche */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.22)',
          zIndex: 3,
          position: 'relative',
          boxShadow: '4px 0 15px rgba(0,0,0,0.2)',
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

        {/* Fondu de transition à gauche */}
        <div style={{
          position: 'absolute', left: 155, top: 0, bottom: 0, width: 40,
          background: 'linear-gradient(to right, rgba(0,14,145,0.8), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Fondu de transition à droite */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
          background: 'linear-gradient(to left, rgba(0,115,244,0.8), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Rail défilant */}
        <div className="ticker-container" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div className="ticker-track" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            width: 'max-content',
            padding: '8px 20px',
          }}>
            {items.map((p, i) => (
              <div 
                key={i} 
                aria-hidden={i >= registeredPorts.length ? "true" : "false"}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  padding: 3,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}>
                  <img src={p.url} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {p.name} {p.country && <span style={{ opacity: 0.65, fontWeight: 400 }}>· {p.country}</span>}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginLeft: 10 }}>&bull;</span>
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
          animation: tickerScroll 32s linear infinite;
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
          .ticker-track { animation-duration: 20s; }
        }
      `}</style>
    </div>
  )
}

export default FlashInfoTicker