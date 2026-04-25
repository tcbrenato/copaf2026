import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const images = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png",
  "/hero6.png",
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const Hero = () => {
  const navigate     = useNavigate()
  const fullText     = `Conférence des Ports Africains\nCOPAF 2026`
  const [displayed,  setDisplayed]  = useState('')
  const [index,      setIndex]      = useState(0)
  const [currentImg, setCurrentImg] = useState(0)
  const [fade,       setFade]       = useState(true)

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
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentImg(prev => (prev + 1) % images.length)
        setFade(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleInscription = () => {
    const el = document.getElementById('inscription')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else navigate('/inscription')
  }

  const handleProgramme = () => scrollToSection('programme')

  const highlight = 'Ports Africains'
  const parts     = displayed.split('\n')
  const line1     = parts[0] || ''
  const line2     = parts[1] || ''
  const pos       = line1.indexOf(highlight)

  return (
    <section
      id="hero"
      style={{
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
      }}
    >
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(255,255,255,0.88)',
        zIndex: 1,
      }} />

      {/* ── Grille deux colonnes ── */}
      <div
        className="hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          zIndex: 2,
          position: 'relative',
        }}
      >

        {/* ── Colonne gauche : texte ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

          {/* Titre dynamique */}
          <h1 style={{
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: 'clamp(30px, 4.5vw, 58px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            color: '#000E91',
            minHeight: '160px',
          }}>
            <span style={{ display: 'block' }}>
              {pos === -1 ? line1 : (
                <>
                  {line1.slice(0, pos)}
                  <span style={{ color: '#0073F4' }}>
                    {line1.slice(pos, pos + highlight.length)}
                  </span>
                  {line1.slice(pos + highlight.length)}
                </>
              )}
            </span>
            {line2 && (
              <div style={{
                marginTop: '10px',
                color: '#000E91',
                opacity: 0.9,
              }}>
                {line2}
              </div>
            )}
          </h1>

          {/* Sous-titre */}
          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            color: '#4A5568',
            maxWidth: '520px',
            lineHeight: 1.7,
            marginBottom: '16px',
          }}>
            Rejoignez l'élite portuaire pour définir le futur de la logistique en Afrique.{' '}
            <span style={{ fontWeight: 700, color: '#000E91' }}>
              Innovation, Réseautage & Stratégie.
            </span>
          </p>

          {/* Stats rapides */}
          <div className="hero-stats" style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '40px',
          }}>
            {[
              { value: '50+',  label: 'Ports membres' },
              { value: '30+',  label: 'Pays représentés' },
              { value: '200+', label: 'Participants' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#000E91' }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={handleInscription}
              style={{
                background: 'linear-gradient(135deg, #0073F4 0%, #000E91 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 36px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,115,244,0.35)',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,115,244,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,115,244,0.35)'
              }}
            >
              S'inscrire Maintenant
            </button>

            <button
              onClick={handleProgramme}
              style={{
                background: 'transparent',
                color: '#000E91',
                border: '2px solid #000E91',
                padding: '14px 36px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#000E91'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#000E91'
              }}
            >
              Voir le Programme
            </button>
          </div>
        </div>

        {/* ── Colonne droite : image ── */}
        <div style={{ position: 'relative' }}>
          {/* Cadre image */}
          <div style={{
            position: 'relative',
            width: '100%',
            padding: '10px',
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 30px 60px rgba(0,14,145,0.15)',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '4/3',
            }}>
              <img
                key={currentImg}
                src={images[currentImg]}
                alt="COPAF 2026"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: fade ? 1 : 0,
                  transform: fade ? 'scale(1)' : 'scale(1.05)',
                  transition: 'all 0.8s ease-in-out',
                }}
              />
              {/* Gradient overlay image */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,14,145,0.45) 0%, transparent 45%)',
              }} />

              {/* Badge localisation/dates */}
              <div
                className="glass-badge"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#0073F4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Localisation</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#000E91', fontWeight: 800 }}>Tanger Med, Maroc</p>
                </div>
                <div style={{ height: '28px', width: '1px', background: '#ddd' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#0073F4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</p>
                  <p style={{ margin: 0, fontSize: '15px', color: '#000E91', fontWeight: 800 }}>15 – 17 Sept. 2026</p>
                </div>
              </div>
            </div>

            {/* Indicateurs de slide */}
            <div style={{
              position: 'absolute',
              top: '-14px',
              right: '24px',
              display: 'flex',
              gap: '6px',
            }}>
              {images.map((_, i) => (
                <div key={i} style={{
                  width: i === currentImg ? '28px' : '8px',
                  height: '5px',
                  background: i === currentImg ? '#0073F4' : '#CBD5E0',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-grid > div:first-child {
            align-items: center !important;
            text-align: center !important;
          }
          .hero-grid > div:first-child h1 {
            text-align: center !important;
          }
          .hero-grid > div:first-child p {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center !important;
          }
          .hero-grid > div:first-child > div {
            justify-content: center !important;
          }
          .hero-stats {
            justify-content: center !important;
          }
        }
        @media (max-width: 540px) {
          #hero {
            padding-top: 80px !important;
            padding-bottom: 40px !important;
          }
          .hero-grid > div:first-child > div:last-child {
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-grid > div:first-child > div:last-child button {
            width: 100% !important;
            max-width: 280px;
          }
          .glass-badge {
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
          .glass-badge > div { text-align: center !important; }
          .glass-badge > div[style*="width: 1px"] { display: none !important; }
        }
      `}</style>
    </section>
  )
}

export default Hero