import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'

// Images locales situées dans le dossier public
const images = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png", 
  "/hero6.png",
]

const Hero = () => {
  const fullText = `Conférence des Ports Africains\nCOPAF 2026`
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const [fade, setFade] = useState(true)

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

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentImg(prev => (prev + 1) % images.length)
        setFade(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(100px, 12vw, 120px) 5% 80px',
      backgroundImage: 'url(/bg3.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      
      {/* Overlay pour la lisibilité */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.85)',
        zIndex: 1
      }} />

      <div className="hero-content" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
        zIndex: 2 
      }}>

        {/* Badge de bienvenue */}
        <div style={{
          background: 'rgba(0, 115, 244, 0.1)',
          color: '#0073F4',
          padding: '8px 16px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          display: 'inline-block'
        }}>
          Évènement Maritime Majeur
        </div>

        {/* Titre dynamique */}
        <h1 style={{
          fontFamily: "'Inter', 'Roboto', sans-serif",
          fontSize: 'clamp(28px, 5vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '24px',
          color: '#000E91',
          minHeight: '140px',
          width: '100%'
        }}>
          {(() => {
            const highlight = 'Ports Africains'
            const parts = displayed.split('\n')
            const line1 = parts[0] || ''
            const line2 = parts[1] || ''
            
            const pos = line1.indexOf(highlight)

            return (
              <>
                <span style={{ display: 'block' }}>
                  {pos === -1 ? line1 : (
                    <>
                      {line1.slice(0, pos)}
                      <span style={{ color: '#0073F4' }}>{line1.slice(pos, pos + highlight.length)}</span>
                      {line1.slice(pos + highlight.length)}
                    </>
                  )}
                </span>
                {line2 && <div style={{ marginTop: '10px', color: '#000E91', opacity: 0.9 }}>{line2}</div>}
              </>
            )
          })()}
          <span style={{
            display: 'inline-block',
            width: '3px', height: '0.8em',
            background: '#0073F4',
            marginLeft: '5px',
            opacity: showCursor ? 1 : 0,
            verticalAlign: 'middle'
          }} />
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 1.8vw, 19px)',
          color: '#4A5568',
          maxWidth: '650px',
          lineHeight: 1.6,
          marginBottom: '40px',
          marginRight: 'auto',
          marginLeft: 'auto'
        }}>
          Rejoignez l'élite portuaire pour définir le futur de la logistique en Afrique. 
          <span style={{ fontWeight: 600, color: '#000E91' }}> Innovation, Réseautage & Stratégie.</span>
        </p>

        {/* Boutons */}
        <div className="hero-buttons" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '60px',
          width: '100%'
        }}>
          <Link to="inscription" smooth={true} duration={600} offset={-80}>
            <button className="btn-primary" style={{
              background: 'linear-gradient(135deg, #0073F4 0%, #000E91 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(0, 115, 244, 0.35)',
              transition: 'all 0.3s ease',
            }}>
              S'inscrire Maintenant
            </button>
          </Link>

          <Link to="programme" smooth={true} duration={600} offset={-80}>
            <button style={{
              background: 'transparent',
              color: '#000E91',
              border: '2px solid #000E91',
              padding: '16px 40px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#000E91'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000E91' }}
            >
              Voir le Programme
            </button>
          </Link>
        </div>

        {/* Cadre Image */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '850px',
          padding: '10px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 30px 60px rgba(0, 14, 145, 0.12)',
        }}>
          <div style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            aspectRatio: '16/9',
          }}>
            <img
              key={currentImg}
              src={images[currentImg]}
              alt="Découvrez la COPAF 2026"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: fade ? 1 : 0,
                transform: fade ? 'scale(1)' : 'scale(1.05)',
                transition: 'all 0.8s ease-in-out',
              }}
            />

            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,14,145,0.4) 0%, transparent 40%)'
            }} />

            <div className="glass-badge" style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '15px 25px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#0073F4', fontWeight: 700, textTransform: 'uppercase' }}>Localisation</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#000E91', fontWeight: 800 }}>Tanger Med, Maroc</p>
              </div>
              <div className="badge-sep" style={{ height: '30px', width: '1px', background: '#ddd' }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#0073F4', fontWeight: 700, textTransform: 'uppercase' }}>Dates</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#000E91', fontWeight: 800 }}>15 – 17 Sept. 2026</p>
              </div>
            </div>
          </div>
          
          <div style={{
            position: 'absolute',
            top: '-15px',
            right: '30px',
            display: 'flex',
            gap: '8px'
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === currentImg ? '30px' : '10px',
                height: '6px',
                background: i === currentImg ? '#0073F4' : '#CBD5E0',
                borderRadius: '10px',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0, 115, 244, 0.45) !important;
        }
        @media (max-width: 640px) {
          #hero { 
            padding-top: 80px; 
            padding-bottom: 40px;
            display: flex;
            align-items: flex-start; /* Évite d'être trop bas sur petit écran */
          }
          .hero-content {
            text-align: center !important;
          }
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
          .hero-buttons a {
            width: 100%;
            max-width: 300px;
          }
          .hero-buttons button {
            width: 100%;
          }
          .glass-badge { 
            flex-direction: column !important; 
            gap: 10px; 
            padding: 12px !important;
            bottom: 10px !important;
            left: 10px !important;
            right: 10px !important;
          }
          .glass-badge div { text-align: center !important; }
          .badge-sep { display: none; }
        }
      `}</style>
    </section>
  )
}

export default Hero