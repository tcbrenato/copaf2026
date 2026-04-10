import React from 'react'

const About = () => {
  const stats = [
    { number: '500+', label: 'Participants Attendus' },
    { number: '25+', label: 'Pays Africains' },
    { number: '50+', label: 'Conférenciers Experts' },
    { number: '3', label: 'Jours Intensifs' },
  ]

  const features = [
    {
      title: 'Networking Premium',
      desc: 'Facilitation de connexions stratégiques entre décideurs, experts et leaders du secteur portuaire et logistique.',
      items: ['Rencontres B2B', 'Ateliers collaboratifs', 'Sessions networking']
    },
    {
      title: 'Conférenciers de Renom',
      desc: 'Sélection rigoureuse d\'experts internationaux et autorités portuaires pour des interventions à haute valeur ajoutée.',
      items: ['Keynote speakers', 'Panels d\'experts', 'Études de cas']
    },
    {
      title: 'Organisation Clé en Main',
      desc: 'Gestion complète de A à Z : thématiques, logistique et expérience participant haut de gamme.',
      items: ['Logistique complète', 'Support multilingue', 'Coordination technique']
    },
  ]

  const pillars = [
    { 
      title: 'Rayonnement Continental', 
      desc: 'Positionnez votre organisation au cœur de l\'écosystème portuaire africain.',
      img: 'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg'
    },
    { 
      title: 'Innovation & Transformation', 
      desc: 'Digitalisation, IA et nouvelles technologies dans les opérations portuaires.',
      img: 'https://i.ibb.co/B55LGMLk/1a6af360ab064cc6bd0d3763d2ceed48.jpg'
    },
    { 
      title: 'Excellence Opérationnelle', 
      desc: 'Meilleures pratiques internationales et stratégies d\'optimisation.',
      img: 'https://i.ibb.co/SwLyK01m/ff254cfe1758352087b3666e8fb7d1ae.jpg'
    },
    { 
      title: 'Formation Continue', 
      desc: 'Ateliers pratiques et certifications pour le capital humain portuaire.',
      img: 'https://i.ibb.co/tMKdK4vv/e4012d2bf39801e869d53477cce2c9c7.jpg'
    },
  ]

  return (
    <section id="about" style={{
      padding: 'clamp(60px, 10vw, 120px) 0',
      background: '#F8F9FF',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(50px, 8vw, 80px)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0,115,244,0.08)',
            border: '1px solid rgba(0,115,244,0.2)',
            borderRadius: '100px',
            padding: '6px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ width: 8, height: 8, background: '#0073F4', borderRadius: '50%' }} />
            <span style={{ color: '#0073F4', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Vision Stratégique 2026
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900,
            color: '#000E91',
            marginBottom: '20px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em'
          }}>
            La Conférence <br />
            <span style={{ color: '#0073F4' }}>des Ports Africains</span>
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: '#4A5568',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.7,
            fontWeight: 400
          }}>
            Une plateforme d'échange stratégique de haut niveau réunissant les décideurs et 
            experts pour façonner l'avenir de la logistique maritime sur le continent.
          </p>
        </div>

        {/* ── GRILLE D'IMAGES ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          {[
            'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg',
            'https://i.ibb.co/SwLyK01m/ff254cfe1758352087b3666e8fb7d1ae.jpg'
          ].map((img, idx) => (
            <div key={idx} className="hover-img" style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 14, 145, 0.1)',
              aspectRatio: '16/10'
            }}>
              <img src={img} alt="COPAF Event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* ── STATS ── */}
        <div className="stats-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          background: '#FFFFFF',
          borderRadius: '30px',
          overflow: 'hidden',
          boxShadow: '0 15px 50px rgba(0, 14, 145, 0.05)',
          marginBottom: '100px',
          border: '1px solid #EDF2F7'
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-item" style={{
              padding: '50px 30px',
              textAlign: 'center',
              borderRight: '1px solid #F1F5F9'
            }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#0073F4', marginBottom: '8px' }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '100px'
        }}>
          {features.map((f, i) => (
            <div key={i} className="card-feature" style={{
              background: '#FFFFFF',
              padding: '45px 35px',
              borderRadius: '24px',
              border: '1px solid #EDF2F7',
              transition: 'all 0.4s ease'
            }}>
              <div style={{ width: '40px', height: '4px', background: '#0073F4', marginBottom: '25px', borderRadius: '2px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#000E91', marginBottom: '15px' }}>{f.title}</h3>
              <p style={{ fontSize: '15px', color: '#4A5568', lineHeight: 1.6, marginBottom: '30px' }}>{f.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {f.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#2D3748', fontWeight: 500 }}>
                    <div style={{ width: '6px', height: '6px', background: '#CBD5E0', borderRadius: '50%' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── PILLARS SECTION ── */}
        <div style={{
          background: '#000E91',
          borderRadius: '40px',
          padding: 'clamp(50px, 8vw, 90px) clamp(24px, 5vw, 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Accent décoratif fond */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(0,115,244,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px' }}>
              Les Piliers de la <span style={{ color: '#0073F4' }}>COPAF 2026</span>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', fontWeight: 300 }}>
              Quatre axes fondamentaux pour la transformation portuaire.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {pillars.map((p, i) => (
              <div key={i} className="pillar-card" style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                transition: '0.3s'
              }}>
                <div style={{ height: '160px', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                </div>
                <div style={{ padding: '25px' }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>
                    {p.title}
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hover-img img { transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .hover-img:hover img { transform: scale(1.08); }
        
        .card-feature:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 115, 244, 0.1);
          border-color: #0073F4;
        }

        .pillar-card:hover {
          background: rgba(255,255,255,0.07) !important;
          transform: translateY(-5px);
        }

        @media (max-width: 768px) {
          .stat-item { border-right: none !important; border-bottom: 1px solid #F1F5F9; }
          .stat-item:last-child { border-bottom: none; }
          .stats-container { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  )
}

export default About