const About = () => {
  const stats = [
    { number: '500+', label: 'Participants Attendus' },
    { number: '25+', label: 'Pays Africains' },
    { number: '50+', label: 'Conférenciers Experts' },
    { number: '3', label: 'Jours Intensifs' },
  ]

  const features = [
    {
      icon: '🤝',
      title: 'Networking Premium',
      desc: 'Facilitation de connexions stratégiques entre décideurs, experts et leaders du secteur portuaire et logistique.',
      items: ['Rencontres B2B', 'Ateliers collaboratifs', 'Sessions networking']
    },
    {
      icon: '🎤',
      title: 'Conférenciers de Renom',
      desc: 'Sélection rigoureuse d\'experts internationaux et autorités portuaires pour des interventions à haute valeur ajoutée.',
      items: ['Keynote speakers', 'Panels d\'experts', 'Études de cas']
    },
    {
      icon: '⚙️',
      title: 'Organisation Clé en Main',
      desc: 'Gestion complète de A à Z : logistique, thématiques, communication et expérience participant.',
      items: ['Logistique complète', 'Support multilingue', 'Coordination technique']
    },
  ]

  const pillars = [
  { 
    icon: '🌍', 
    title: 'Rayonnement Continental', 
    desc: 'Positionnez votre organisation au cœur de l\'écosystème portuaire africain.',
    img: 'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg'
  },
  { 
    icon: '🤖', 
    title: 'Innovation & Transformation', 
    desc: 'Digitalisation, IA et nouvelles technologies dans les opérations portuaires.',
    img: 'https://i.ibb.co/B55LGMLk/1a6af360ab064cc6bd0d3763d2ceed48.jpg'
  },
  { 
    icon: '🏆', 
    title: 'Excellence Opérationnelle', 
    desc: 'Meilleures pratiques internationales et stratégies d\'optimisation.',
    img: 'https://i.ibb.co/SwLyK01m/ff254cfe1758352087b3666e8fb7d1ae.jpg'
  },
  { 
    icon: '📚', 
    title: 'Formation Continue', 
    desc: 'Ateliers pratiques et certifications pour le capital humain portuaire.',
    img: 'https://i.ibb.co/tMKdK4vv/e4012d2bf39801e869d53477cce2c9c7.jpg'
  },
]

  return (
    <section id="about" style={{
      padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px)',
      background: '#f8f9ff',
      fontFamily: 'Roboto, sans-serif',
      textAlign: 'center',
    }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 'clamp(40px, 7vw, 72px)' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,115,244,0.08)',
          border: '1px solid rgba(0,115,244,0.25)',
          borderRadius: 100, padding: '6px 22px', marginBottom: 18
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Excellence Événementielle
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900,
          color: '#000e91', marginBottom: 16, lineHeight: 1.15
        }}>
          La Conférence Officielle<br />
          <span style={{ color: '#0073f4' }}>des Ports Africains</span>
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 17px)', color: '#666',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.8, fontWeight: 300
        }}>
          Une plateforme d'échange stratégique réunissant décideurs portuaires,
          experts en formation et leaders africains pour façonner l'avenir du secteur.
        </p>
      </div>

      {/* ── IMAGES ── */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 'clamp(16px, 3vw, 24px)',
  marginBottom: 'clamp(48px, 8vw, 80px)',
}}>
  {[
    'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg',
    'https://i.ibb.co/SwLyK01m/ff254cfe1758352087b3666e8fb7d1ae.jpg',
  ].map((src, i) => (
    <div key={i} style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,14,145,0.12)',
      border: '1px solid rgba(0,115,244,0.12)',
      aspectRatio: '16/9',
      transition: 'all 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,115,244,0.18)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,14,145,0.12)'
      }}
    >
      <img
        src={src}
        alt={`COPAF 2026 - Image ${i + 1}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  ))}
</div>

      {/* ── STATS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        marginBottom: 'clamp(48px, 8vw, 80px)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 40px rgba(0,14,145,0.08)',
        border: '1px solid rgba(0,115,244,0.12)',
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            padding: 'clamp(28px, 5vw, 44px) clamp(12px, 3vw, 20px)',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRight: (i % 2 === 0) ? '1px solid rgba(0,115,244,0.1)' : 'none',
            borderBottom: (i < 2) ? '1px solid rgba(0,115,244,0.1)' : 'none',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <div style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 'clamp(36px, 7vw, 52px)', fontWeight: 900,
              color: '#0073f4', lineHeight: 1
            }}>
              {stat.number}
            </div>
            <div style={{
              fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#999',
              letterSpacing: 2, textTransform: 'uppercase', marginTop: 10, fontWeight: 500
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(48px, 8vw, 80px)'
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,115,244,0.1)',
            borderRadius: 16,
            padding: 'clamp(24px, 4vw, 36px)',
            boxShadow: '0 2px 20px rgba(0,14,145,0.05)',
            transition: 'all 0.3s', cursor: 'default',
            textAlign: 'center',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,115,244,0.12)'
              e.currentTarget.style.borderColor = 'rgba(0,115,244,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,14,145,0.05)'
              e.currentTarget.style.borderColor = 'rgba(0,115,244,0.1)'
            }}
          >
            {/* Icône centrée */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(0,115,244,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 20,
              margin: '0 auto 20px',
            }}>
              {f.icon}
            </div>

            <h3 style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 19px)', fontWeight: 700,
              marginBottom: 12, color: '#000e91'
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: 'clamp(13px, 1.8vw, 14px)', color: '#777', lineHeight: 1.7, marginBottom: 20
            }}>
              {f.desc}
            </p>

            <div style={{ height: 1, background: 'rgba(0,115,244,0.08)', marginBottom: 16 }} />

            {/* Items centrés */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {f.items.map((item, j) => (
                <li key={j} style={{
                  fontSize: 13, color: '#555',
                  padding: '5px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#0073f4', flexShrink: 0, display: 'inline-block'
                  }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── PILLARS ── */}
      <div style={{
        background: '#000e91', borderRadius: 20,
        padding: 'clamp(36px, 6vw, 60px) clamp(20px, 5vw, 48px)',
        boxShadow: '0 8px 48px rgba(0,14,145,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 'clamp(28px, 5vw, 48px)' }}>
          <h3 style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 'clamp(20px, 3vw, 36px)',
            fontWeight: 900, color: '#FFFFFF', marginBottom: 10
          }}>
            Les Piliers de la <span style={{ color: '#0073f4' }}>COPAF 2026</span>
          </h3>
          <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
            Quatre axes stratégiques pour transformer l'écosystème portuaire africain
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(12px, 2.5vw, 20px)'
        }}>
          {pillars.map((p, i) => (
  <div key={i} style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    transition: 'all 0.3s'
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(0,115,244,0.15)'
      e.currentTarget.style.borderColor = 'rgba(0,115,244,0.4)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
  >
    {/* Image */}
    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
      <img
        src={p.img}
        alt={p.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      />
    </div>

    {/* Contenu */}
    <div style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(0,115,244,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, margin: '0 auto 12px'
      }}>
        {p.icon}
      </div>
      <h4 style={{
        fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: 700,
        marginBottom: 8, color: '#FFFFFF'
      }}>
        {p.title}
      </h4>
      <p style={{
        fontSize: 'clamp(12px, 1.6vw, 13px)',
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 1.7, fontWeight: 300, margin: 0
      }}>
        {p.desc}
      </p>
    </div>
  </div>
))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          #about .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>

    </section>
  )
}

export default About