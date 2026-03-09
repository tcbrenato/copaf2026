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
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px 60px 80px',
      background: '#FFFFFF',
    }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 60,
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto'
      }}>

        {/* COLONNE GAUCHE */}
        <div>

          {/* Titre typewriter */}
<h1 style={{
  fontFamily: 'Roboto, sans-serif',
  fontSize: 'clamp(24px, 3vw, 42px)',
  fontWeight: 900,
  lineHeight: 1.3,
  marginBottom: 24,
  color: '#000e91',
  minHeight: '160px',
}}>
  {(() => {
    const highlight = 'Ports Africains'
    const pos = displayed.indexOf(highlight)
    if (pos === -1) {
      return <span>{displayed}</span>
    }
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
    transition: 'opacity 0.1s'
  }} />
</h1>

          {/* Sous-titre */}
          <p style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 17, color: '#555',
            maxWidth: 500, lineHeight: 1.8,
            marginBottom: 40, fontWeight: 300
          }}>
            3 jours de formation intensive pour les dirigeants portuaires africains.
            Transformer les défis de la digitalisation en leviers de croissance.
          </p>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="inscription" smooth={true} duration={600} offset={-80}>
              <button style={{
                background: '#0073f4', color: '#FFFFFF',
                border: 'none', padding: '16px 36px', borderRadius: 6,
                fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 14,
                letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,115,244,0.3)'
              }}
                onMouseEnter={e => { e.target.style.background = '#005fd4'; e.target.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.target.style.background = '#0073f4'; e.target.style.transform = 'translateY(0)' }}
              >
                S'inscrire Maintenant
              </button>
            </Link>

            <Link to="programme" smooth={true} duration={600} offset={-80}>
              <button style={{
                background: '#000e91', color: '#FFFFFF',
                border: 'none', padding: '16px 36px', borderRadius: 6,
                fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 14,
                letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(0,14,145,0.25)'
              }}
                onMouseEnter={e => { e.target.style.background = '#000b7a'; e.target.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.target.style.background = '#000e91'; e.target.style.transform = 'translateY(0)' }}
              >
                Voir le Programme
              </button>
            </Link>
          </div>
        </div>

        {/* COLONNE DROITE — Image avec bordure animée */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          position: 'relative', padding: 8
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
            width: '100%', aspectRatio: '4/3',
            boxShadow: '0 20px 60px rgba(0,14,145,0.15)'
          }}>
            <img
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80"
              alt="Port Africain"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Badge sur l'image */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, right: 20,
              background: 'rgba(0,14,145,0.88)',
              backdropFilter: 'blur(10px)',
              borderRadius: 10, padding: '14px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontFamily: 'Roboto', fontSize: 11,
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'uppercase', letterSpacing: 2
                }}>
                  Dubaï · Émirats Arabes Unis
                </div>
                <div style={{
                  fontFamily: 'Roboto', fontSize: 16,
                  fontWeight: 700, color: '#FFFFFF'
                }}>
                  15 – 17 Septembre 2026
                </div>
              </div>
              <div style={{
                background: '#0073f4', color: '#fff',
                borderRadius: 8, padding: '8px 14px', textAlign: 'center',
                fontFamily: 'Roboto', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.5
              }}>
                All-Inclusive<br />$5,000
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation bordure */}
      <style>{`
        @keyframes borderSpin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}

export default Hero