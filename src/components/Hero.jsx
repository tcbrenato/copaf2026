import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BrochureDownloadButton from './BrochureDownloadButton'

const images = [
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
  "/hero4.png",
  "/hero5.png",
  "/hero6.png",
  "/hero7.png",
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const Hero = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentImg, setCurrentImg] = useState(0)
  
  const stats = [
    { value: "+50", label: "Autorités portuaires" },
    { value: "150+", label: "Congressistes" },
    { value: "2J + 1J", label: "Conférences & Immersion (Port de Casablanca)" }
  ]

  const [fade, setFade] = useState(true)
  const [statsIn, setStatsIn] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentImg(prev => (prev + 1) % images.length)
        setFade(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setStatsIn(true), 500)
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
        minHeight: 'calc(100vh - var(--copaf-header-h, 130px))',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(20px, 3vw, 40px) 6%',
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
        background: 'linear-gradient(120deg, rgba(2,12,58,0.94) 0%, rgba(0,30,80,0.86) 60%, rgba(0,70,160,0.65) 100%)',
        zIndex: 1,
      }} />

      {/* Content grid */}
      <div className="hero-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '64px',
        alignItems: 'center',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 2,
        position: 'relative',
      }}>

        {/* ── LEFT ── */}
        <div className="hero-left">
          <h1 style={{
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: 'clamp(28px, 3.4vw, 44px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '18px',
            color: '#fff',
            letterSpacing: '-1.3px',
          }}>
            {t('hero.titlePart1')}{' '}
            <span style={{
              background: 'linear-gradient(90deg, #4DA6FF, #00C8FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('hero.titlePart2')}
            </span>
            <br />
            <span style={{ opacity: 0.85, fontSize: '0.65em', letterSpacing: '-0.5px', fontWeight: 700 }}>{t('hero.kicker')}</span>
          </h1>

          <p className="hero-subtitle" style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.72)',
            maxWidth: '460px',
            lineHeight: 1.6,
            marginBottom: '26px',
          }}>
            Trois jours de réflexion scientifique et d'échanges stratégiques réunissant experts, décideurs et institutions portuaires autour de « <strong style={{ color: '#fff', fontWeight: 800 }}>Smart Port Africain : IA et cybersécurité au service de la performance</strong> ».
          </p>

          {/* Stats */}
          <div className="hero-stats" style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '26px',
            opacity: statsIn ? 1 : 0,
            transform: statsIn ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease',
          }}>
            {stats.map(({ value, label }, index) => (
              <div key={label} style={{ maxWidth: index === 2 ? '170px' : 'none' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '5px', lineHeight: 1.3 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="hero-buttons" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Premier bouton : Plein avec effet hover bordure sans fond */}
            <button onClick={handleInscription} className="hero-cta-outline">
              {t('hero.registerButton')}
            </button>

            {/* Deuxième bouton : Animation bateau */}
            <button onClick={() => scrollToSection('programme')} className="hero-boat-btn">
              <span>{t('hero.programmeButton')}</span>
              <div className="water-wave" aria-hidden="true">
                <span className="boat-icon">🚢</span>
              </div>
            </button>

            {/* Troisième bouton : Brochure avec la même classe d'animation */}
            <div className="hero-boat-wrapper">
              <BrochureDownloadButton label={t('hero.downloadButton')} variant="boat-custom" />
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-right" style={{ position: 'relative' }}>
          <div className="hero-card" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '22px',
            padding: '10px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 24px 56px rgba(0,0,0,0.35)',
          }}>
            <div style={{
              borderRadius: '15px',
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
                  transition: 'opacity 0.8s ease',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,8,40,0.78) 0%, transparent 55%)',
              }} />

              {/* Badge lieu / dates / limite */}
              <div className="glass-badge" style={{
                position: 'absolute',
                bottom: '14px', left: '14px', right: '14px',
                background: 'rgba(2,6,32,0.85)',
                backdropFilter: 'blur(14px)',
                borderRadius: '13px',
                padding: '13px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(0,115,244,0.2)',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '9.5px', color: '#4DA6FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lieu</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 800, marginTop: '3px' }}>Casablanca</p>
                </div>
                <div className="glass-badge-divider" style={{ height: '26px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '9.5px', color: '#4DA6FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dates</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 800, marginTop: '3px' }}>15–17 Sept.</p>
                </div>
                <div className="glass-badge-divider" style={{ height: '26px', width: '1px', background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '9.5px', color: '#FF9D5C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Limite</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 800, marginTop: '3px' }}>09 Sept.</p>
                </div>
              </div>
            </div>

            {/* Mention organisateurs officielle validée */}
            <p style={{
              margin: 0,
              padding: '12px 6px 4px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
            }}>
              Organisé par <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>CRF Perfection</span> · sous l'égide conjointe de l'AGPAOC et l'UAPNA et sous le haut patronage de l'ANP
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* Premier bouton : Plein par défaut, bordure lumineuse au survol */
        .hero-cta-outline {
          background: linear-gradient(135deg, #0073F4, #005CC4);
          color: #fff;
          border: 2px solid transparent;
          padding: 15px 36px;
          border-radius: 11px;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,115,244,0.4);
          transition: all 0.35s ease;
          font-family: inherit;
        }
        .hero-cta-outline:hover {
          background: transparent;
          border-color: #00C8FF;
          color: #00C8FF;
          box-shadow: 0 0 20px rgba(0,200,255,0.3);
          transform: translateY(-2px);
        }

        /* Boutons secondaires & Brochure avec animation bateau / vague propre */
        .hero-boat-btn, .hero-boat-wrapper button {
          background: transparent !important;
          border: none !important;
          padding: 0 0 8px 0 !important;
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          letter-spacing: 0.4px !important;
          cursor: pointer !important;
          font-family: inherit !important;
          opacity: 0.85;
          position: relative;
          display: inline-flex !important;
          flex-direction: column;
          overflow: visible !important;
          box-shadow: none !important;
          transition: opacity 0.2s ease;
        }
        .hero-boat-btn:hover, .hero-boat-wrapper button:hover {
          opacity: 1;
          background: transparent !important;
        }

        /* Ligne d'eau / vagues avec effet typewriter */
        .water-wave, .hero-boat-wrapper button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #4DA6FF, #00C8FF);
          transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Bateau naviguant */
        .boat-icon {
          position: absolute;
          right: -12px;
          top: -16px;
          font-size: 15px;
          transform: scale(0);
          transition: transform 0.3s ease 0.2s;
          animation: floatBoat 1.5s ease-in-out infinite alternate;
        }

        .hero-boat-btn:hover .water-wave {
          width: 100%;
        }
        .hero-boat-btn:hover .boat-icon {
          transform: scale(1);
        }

        /* Adaptation pour le composant externe BrochureDownloadButton si requis */
        .hero-boat-wrapper button {
          position: relative;
        }
        .hero-boat-wrapper button:hover::after {
          width: 100%;
        }

        @keyframes floatBoat {
          0% { transform: scale(1) translateY(0) rotate(0deg); }
          100% { transform: scale(1) translateY(-3px) rotate(-3deg); }
        }

        @media (max-width: 900px) {
          #hero {
            min-height: auto !important;
            padding-top: clamp(16px, 4vw, 28px) !important;
            padding-bottom: 32px !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .hero-left {
            display: flex;
            flex-direction: column;
            align-items: center !important;
            text-align: center !important;
          }
          .hero-subtitle { margin-left: auto !important; margin-right: auto !important; }
          .hero-stats, .hero-buttons { justify-content: center !important; }
        }

        @media (max-width: 540px) {
          .hero-buttons { flex-direction: column !important; align-items: center !important; gap: 16px !important; }
          .hero-cta-outline { width: 100%; max-width: 300px; }
          .glass-badge { padding: 11px !important; }
          .glass-badge p { font-size: 11px !important; }
        }
      `}</style>
    </section>
  )
}

export default Hero