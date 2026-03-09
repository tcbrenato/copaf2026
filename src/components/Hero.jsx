import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'

const Hero = () => {
  const fullText = "Conférence Officielle sur les Ports Africains et la Formation (COPAF 2026)"
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayed(fullText.slice(0, index + 1))
        setIndex(index + 1)
      }, 40)
      return () => clearTimeout(timeout)
    }
  }, [index, fullText])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(100px, 12vw, 120px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 80px)',
      background: '#FFFFFF',
    }}>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
      }}>

        {/* Titre typewriter */}
        <h1 style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 'clamp(22px, 4vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.3,
          marginBottom: 'clamp(16px, 3vw, 24px)',
          color: '#000e91',
          minHeight: 'clamp(100px, 18vw, 150px)',
        }}>
          {(() => {
            const highlight = 'Ports Africains'
            const pos = displayed.indexOf(highlight)
            if (pos === -1) return <span>{displayed}</span>
            return (
              <>
                <span>{displayed.slice(0, pos)}</span>
                <span style={{ color: '#0073f4' }}>{displayed.slice(pos, pos + highlight.length)}</span>
                <span>{displayed.slice(pos + highlight.length)}</span>
              </>
            )
          })()}
          <span style={{
            display: 'inline-block',
            width: 3, height: '1em',
            background: '#0073f4',
            marginLeft: 2,
            verticalAlign: 'middle',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s',
          }} />
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 'clamp(14px, 2vw, 17px)',
          color: '#555',
          maxWidth: 560,
          lineHeight: 1.8,
          marginBottom: 'clamp(28px, 5vw, 40px)',
          fontWeight: 300,
        }}>
          3 jours de formation intensive pour les dirigeants portuaires africains.
          Transformer les défis de la digitalisation en leviers de croissance.
        </p>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(10px, 2vw, 16px)',
          flexWrap: 'wrap',
          marginBottom: 'clamp(40px, 7vw, 64px)',
        }}>
          <Link to="inscription" smooth={true} duration={600} offset={-80}>
            <button style={{
              background: '#0073f4', color: '#FFFFFF',
              border: 'none',
              padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 36px)',
              borderRadius: 6,
              fontFamily: 'Roboto, sans-serif', fontWeight: 700,
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(0,115,244,0.3)',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#005fd4'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0073f4'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              S'inscrire Maintenant
            </button>
          </Link>

          <Link to="programme" smooth={true} duration={600} offset={-80}>
            <button style={{
              background: '#000e91', color: '#FFFFFF',
              border: 'none',
              padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 36px)',
              borderRadius: 6,
              fontFamily: 'Roboto, sans-serif', fontWeight: 700,
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(0,14,145,0.25)',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000b7a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000e91'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Voir le Programme
            </button>
          </Link>
        </div>

        {/* Image avec bordure animée */}
        <div style={{
          position: 'relative',
          padding: 8,
          width: '100%',
          maxWidth: 720,
        }}>
          {/* Contour animé */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 20,
            background: 'linear-gradient(270deg, #0073f4, #000e91, #0073f4)',
            backgroundSize: '400% 400%',
            animation: 'borderSpin 3s ease infinite',
            zIndex: 0,
          }} />

          {/* Masque blanc intérieur */}
          <div style={{
            position: 'absolute', inset: 3,
            borderRadius: 18,
            background: '#FFFFFF',
            zIndex: 1,
          }} />

          {/* Image */}
          <div style={{
            position: 'relative', zIndex: 2,
            borderRadius: 14, overflow: 'hidden',
            width: '100%', aspectRatio: '16/9',
            boxShadow: '0 20px 60px rgba(0,14,145,0.15)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80"
              alt="Port Africain"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Badge sur l'image */}
            <div style={{
              position: 'absolute',
              bottom: 'clamp(10px, 3vw, 20px)',
              left: 'clamp(10px, 3vw, 20px)',
              right: 'clamp(10px, 3vw, 20px)',
              background: 'rgba(0,14,145,0.88)',
              backdropFilter: 'blur(10px)',
              borderRadius: 10,
              padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 20px)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Roboto',
                  fontSize: 'clamp(9px, 1.5vw, 11px)',
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase', letterSpacing: 2,
                }}>
                  Dubaï · Émirats Arabes Unis
                </div>
                <div style={{
                  fontFamily: 'Roboto',
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  fontWeight: 700, color: '#FFFFFF',
                }}>
                  15 – 17 Septembre 2026
                </div>
              </div>
              <div style={{
                background: '#0073f4', color: '#fff',
                borderRadius: 8,
                padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 14px)',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 1, lineHeight: 1.5, flexShrink: 0,
              }}>
                All-Inclusive<br />$5,000
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (max-width: 640px) {
          #hero { padding-top: 100px !important; }
        }
        @media (max-width: 400px) {
          #hero a { width: 100%; }
          #hero a button { width: 100%; text-align: center; }
        }
      `}</style>
    </section>
  )
}

export default Hero