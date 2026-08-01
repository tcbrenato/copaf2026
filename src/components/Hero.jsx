import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BrochureDownloadButton from './BrochureDownloadButton'

const images = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png",
  "/hero6.png",
  "/hero7.png",
  "/copaf.png",
  "/copaflancement.jpg",
  "/logocopafbleu.jpg",
  "/logocopaf.png",
  "/lieucopaf.jpg",
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const STATS = [
  { value: '50+',  label: 'Ports membres' },
  { value: '30+',  label: 'Pays représentés' },
  { value: '200+', label: 'Participants' },
]

const Hero = () => {
  const navigate     = useNavigate()
  const [currentImg, setCurrentImg] = useState(0)
  const [fade,       setFade]       = useState(true)
  const [statsIn,    setStatsIn]    = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentImg(prev => (prev + 1) % images.length)
        setFade(true)
      }, 600)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setStatsIn(true), 600)
    return () => clearTimeout(t)
  }, [])

  const handleInscription = () => {
    const el = document.getElementById('inscription')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else navigate('/inscription')
  }

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(80px, 8vw, 100px) 6% 32px',
      }}
    >
      {/* Background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${images[currentImg]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.8s ease',
        zIndex: 0,
      }} />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,14,100,0.93) 0%, rgba(0,30,80,0.85) 55%, rgba(0,80,180,0.60) 100%)',
        zIndex: 1,
      }} />

      {/* Content grid */}
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '44px',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1180,
        margin: '0 auto',
        zIndex: 2,
        position: 'relative',
      }}>

        {/* ── LEFT ── */}
        <div className="hero-left">

          {/* Title */}
          <h1 style={{
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: 'clamp(28px, 3.8vw, 46px)',
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: '14px',
            color: '#fff',
            letterSpacing: '-1.5px',
          }}>
            Conférence des{' '}
            <span style={{
              background: 'linear-gradient(90deg, #4DA6FF, #00C8FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Ports Africains
            </span>
            <br />
            <span style={{ opacity: 0.85, fontSize: '0.7em', letterSpacing: '-0.5px' }}>COPAF 2026</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle" style={{
            fontSize: 'clamp(13px, 1.2vw, 15px)',
            color: 'rgba(255,255,255,0.70)',
            maxWidth: '460px',
            lineHeight: 1.6,
            marginBottom: '22px',
          }}>
            Trois jours de réflexion scientifique et d'échanges stratégiques réunissant experts,
            décideurs et institutions portuaires autour de la thématique « Smart Port Africain : IA
            et cybersécurité au service de la performance ».
            <span style={{ color: '#fff', fontWeight: 700, display: 'block', marginTop: '10px' }}>
              Apprentissage · Réseautage · Stratégie.
            </span>
          </p>

          {/* Stats */}
          <div className="hero-stats" style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '26px',
            opacity: statsIn ? 1 : 0,
            transform: statsIn ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease',
          }}>
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontSize: 'clamp(20px, 2.2vw, 26px)',
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.50)',
                  marginTop: '6px',
                  letterSpacing: '0.3px',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="hero-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleInscription}
              style={{
                background: 'linear-gradient(135deg, #0073F4, #005CC4)',
                color: '#fff',
                border: 'none',
                padding: '13px 34px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(0,115,244,0.45)',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,115,244,0.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,115,244,0.45)' }}
            >
              S'inscrire Maintenant
            </button>

            <button
              onClick={() => scrollToSection('programme')}
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.30)',
                padding: '11px 28px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.30)' }}
            >
              Voir le Programme
            </button>

            {/* Telechargement brochure (capture email) — style adapte au fond sombre du Hero */}
            <BrochureDownloadButton
              label="Télécharger la brochure"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.30)',
                padding: '11px 28px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
              }}
            />
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-right" style={{ position: 'relative' }}>

          {/* Glow */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '75%', height: '75%',
            background: 'radial-gradient(circle, rgba(0,115,244,0.25) 0%, transparent 70%)',
            filter: 'blur(36px)',
            zIndex: 0,
          }} />

          {/* Card */}
          <div className="hero-card" style={{
            position: 'relative', zIndex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            padding: '10px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
          }}>
            {/* Image */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              aspectRatio: '16/11',
              position: 'relative',
            }}>
              <img
                src={images[currentImg]}
                alt="COPAF 2026"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: fade ? 1 : 0,
                  transform: fade ? 'scale(1)' : 'scale(1.04)',
                  transition: 'all 0.8s ease',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,10,70,0.75) 0%, transparent 55%)',
              }} />

              {/* Location/Date badge */}
              <div className="glass-badge" style={{
                position: 'absolute',
                bottom: '14px', left: '14px', right: '14px',
                background: 'rgba(0,8,50,0.78)',
                backdropFilter: 'blur(14px)',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(0,115,244,0.25)',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#4DA6FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Localisation</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 800, marginTop: '3px' }}>Casablanca, Maroc</p>
                </div>
                <div className="glass-badge-divider" style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#4DA6FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 800, marginTop: '3px' }}>15, 16 &amp; 17 Sept. 2026</p>
                </div>
              </div>

              {/* Organiser badge */}
              <div className="hero-badge-organiser" style={{
                position: 'absolute',
                top: '14px', right: '14px',
                background: 'rgba(0,8,50,0.78)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.10)',
                maxWidth: '210px',
              }}>
                <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organisé par</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#fff', fontWeight: 700, marginTop: '2px' }}>CRF Perfection</p>
                <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: '4px', lineHeight: 1.4 }}>
                  Sous l'égide de l'AGPAOC<br />Sous le haut patronage de l'ANP
                </p>
              </div>
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', paddingTop: '10px' }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  style={{
                    width: i === currentImg ? '24px' : '7px',
                    height: '5px',
                    background: i === currentImg ? '#0073F4' : 'rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating deadline card */}
          <div className="hero-badge-deadline" style={{
            position: 'absolute',
            top: '-18px', left: '-18px',
            background: 'linear-gradient(135deg, #0073F4, #000E91)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 10px 24px rgba(0,115,244,0.45)',
            zIndex: 2,
          }}>
            <p style={{ margin: 0, fontSize: '9px', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date limite</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 800, marginTop: '2px' }}>31 Août 2026</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        onClick={() => scrollToSection('about')}
        style={{
          position: 'absolute',
          bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          zIndex: 2, cursor: 'pointer', opacity: 0.5,
        }}
      >
        <span style={{ fontSize: '10px', color: '#fff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Découvrir</span>
        <div className="scroll-line" />
      </div>

      <style>{`
        .scroll-line {
          width: 1px;
          height: 32px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.5; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.2); }
        }

        /* ── Tablette / Desktop étroit ── */
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .hero-left {
            display: flex;
            flex-direction: column;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-subtitle {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center !important;
          }
          .hero-stats {
            justify-content: center !important;
          }
          .hero-buttons {
            justify-content: center !important;
          }
          /* La carte flottante "Date limite" déborde du cadre en tablette : on la ramène à l'intérieur */
          .hero-badge-deadline {
            top: 10px !important;
            left: 10px !important;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 540px) {
          #hero {
            padding-top: 90px !important;
            padding-bottom: 60px !important;
          }
          .hero-buttons {
            flex-wrap: wrap !important;
          }
          .hero-buttons button {
            width: 100% !important;
            max-width: 300px !important;
          }
          .glass-badge {
            flex-direction: column !important;
            gap: 10px !important;
            text-align: center !important;
          }
          .glass-badge > div { text-align: center !important; }
          .glass-badge-divider { display: none !important; }

          /* Les deux badges flottants se chevauchaient avec le titre/l'image en mobile :
             on les repasse en position statique, empilés au-dessus de la carte. */
          .hero-right {
            display: flex;
            flex-direction: column-reverse;
            gap: 10px;
          }
          .hero-badge-deadline,
          .hero-badge-organiser {
            position: static !important;
            width: fit-content;
            max-width: none !important;
          }
          .hero-badge-deadline {
            align-self: flex-start;
          }
          .hero-badge-organiser {
            align-self: flex-end;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </section>
  )
}

export default Hero