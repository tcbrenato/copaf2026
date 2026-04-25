import React from 'react'

const About = () => {
  const stats = [
    { number: '300+', label: 'Participants Attendus' },
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
      desc: "Sélection rigoureuse d'experts internationaux et autorités portuaires pour des interventions à haute valeur ajoutée.",
      items: ['Keynote speakers', "Panels d'experts", 'Études de cas']
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
      desc: "Positionnez votre organisation au cœur de l'écosystème portuaire africain.",
      img: 'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg'
    },
    {
      title: 'Innovation & Transformation',
      desc: 'Digitalisation, IA et nouvelles technologies dans les opérations portuaires.',
      img: 'https://i.ibb.co/B55LGMLk/1a6af360ab064cc6bd0d3763d2ceed48.jpg'
    },
    {
      title: 'Excellence Opérationnelle',
      desc: "Meilleures pratiques internationales et stratégies d'optimisation.",
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
      background: '#f9fafb',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Arrière-plan réseau digital SVG ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 1200"
      >
        <rect width="1440" height="1200" fill="#f9fafb" />
        {[
          [80,100,320,70],[320,70,560,180],[560,180,760,80],[760,80,1000,160],[1000,160,1220,70],[1220,70,1400,150],
          [80,100,180,300],[180,300,340,380],[340,380,500,300],[500,300,560,180],[560,180,660,360],[660,360,820,420],
          [820,420,1000,340],[1000,340,1140,420],[1140,420,1300,340],[1300,340,1400,460],
          [180,300,260,520],[260,520,420,600],[420,600,580,520],[580,520,740,620],[740,620,900,540],
          [900,540,1060,620],[1060,620,1220,520],[1220,520,1400,600],
          [260,520,300,750],[420,600,460,820],[740,620,760,840],[1060,620,1100,800],
          [300,750,500,900],[500,900,700,820],[700,820,900,940],[900,940,1100,860],[1100,860,1300,960],
          [320,70,260,520],[1000,160,900,540],[1220,70,1220,520],[580,520,660,360],[740,620,760,80],
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.45" />
        ))}
        {[
          [80,100],[320,70],[560,180],[760,80],[1000,160],[1220,70],[1400,150],
          [180,300],[340,380],[500,300],[660,360],[820,420],[1000,340],[1140,420],[1300,340],[1400,460],
          [260,520],[420,600],[580,520],[740,620],[900,540],[1060,620],[1220,520],[1400,600],
          [300,750],[500,900],[700,820],[900,940],[1100,860],[1300,960],
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 5 === 0 ? 5 : 3} fill={i % 7 === 0 ? '#0073F4' : '#818cf8'} opacity="0.55" />
        ))}
        {[[320,70],[760,80],[1000,160],[560,180],[820,420],[500,900]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="7" fill="none" stroke="#0073F4" strokeWidth="1.5" opacity="0.35" />
        ))}
      </svg>

      {/* Overlay léger */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(249,250,251,0.78)', zIndex: 1 }} />

      {/* ── Contenu ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>

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
            marginBottom: '24px',
          }}>
            <div style={{ width: 8, height: 8, background: '#0073F4', borderRadius: '50%' }} />
            <span style={{ color: '#0073F4', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Vision Stratégique 2026
            </span>
          </div>

          {/* Titre sur une seule ligne desktop */}
          <h2 className="about-title" style={{
            fontSize: 'clamp(24px, 4.5vw, 52px)',
            fontWeight: 900,
            color: '#000E91',
            marginBottom: '20px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            La Conférence des{' '}
            <span style={{ color: '#0073F4' }}>Ports Africains</span>
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: '#4A5568',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Une plateforme d'échange stratégique de haut niveau réunissant les décideurs et
            experts pour façonner l'avenir de la logistique maritime sur le continent.
          </p>
        </div>

        {/* ── GRILLE D'IMAGES avec hover swap ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '60px',
        }}>
          {[
            {
              base: 'https://i.ibb.co/4w549y0X/50a4f17346a18177b6d5c62af467d029.jpg',
              hover: 'https://i.ibb.co/B55LGMLk/1a6af360ab064cc6bd0d3763d2ceed48.jpg',
            },
            {
              base: 'https://i.ibb.co/SwLyK01m/ff254cfe1758352087b3666e8fb7d1ae.jpg',
              hover: 'https://i.ibb.co/tMKdK4vv/e4012d2bf39801e869d53477cce2c9c7.jpg',
            },
          ].map(({ base, hover }, idx) => (
            <div key={idx} className="img-swap-card" style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 14, 145, 0.10)',
              aspectRatio: '16/10',
              position: 'relative',
            }}>
              {/* Image de base */}
              <img
                className="img-base"
                src={base}
                alt="COPAF Event"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.5s ease, transform 0.6s ease',
                }}
              />
              {/* Image hover */}
              <img
                className="img-hover"
                src={hover}
                alt="COPAF Event"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: 0,
                  transform: 'scale(1.05)',
                  transition: 'opacity 0.5s ease, transform 0.6s ease',
                }}
              />
              {/* Overlay dégradé bas */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,14,145,0.35) 0%, transparent 50%)',
                zIndex: 1,
              }} />
            </div>
          ))}
        </div>

        {/* ── STATS ── */}
        <div className="stats-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 15px 50px rgba(0, 14, 145, 0.07)',
          marginBottom: '80px',
          border: '1px solid rgba(0,14,145,0.07)',
        }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-item" style={{
              padding: 'clamp(30px, 5vw, 50px) 20px',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid #EDF2F7' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 900, color: '#0073F4', marginBottom: '8px' }}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '80px',
        }}>
          {features.map((f, i) => (
            <div key={i} className="card-feature" style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(8px)',
              padding: 'clamp(30px, 4vw, 45px) clamp(24px, 3vw, 35px)',
              borderRadius: '20px',
              border: '1px solid rgba(0,14,145,0.07)',
              transition: 'all 0.4s ease',
            }}>
              <div style={{ width: '40px', height: '4px', background: '#0073F4', marginBottom: '24px', borderRadius: '2px' }} />
              <h3 style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 800, color: '#000E91', marginBottom: '14px' }}>{f.title}</h3>
              <p style={{ fontSize: '15px', color: '#4A5568', lineHeight: 1.6, marginBottom: '28px' }}>{f.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {f.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#2D3748', fontWeight: 500 }}>
                    <div style={{ width: '6px', height: '6px', background: '#0073F4', borderRadius: '50%', flexShrink: 0 }} />
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
          borderRadius: '32px',
          padding: 'clamp(40px, 7vw, 80px) clamp(24px, 5vw, 60px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Accent décoratif */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(0,115,244,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '250px', height: '250px', background: 'rgba(0,115,244,0.08)', borderRadius: '50%', filter: 'blur(60px)' }} />

          <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>
            <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#FFFFFF', marginBottom: '14px', lineHeight: 1.2 }}>
              Les Piliers de la <span style={{ color: '#0073F4' }}>COPAF 2026</span>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px, 1.5vw, 16px)', fontWeight: 300, margin: 0 }}>
              Quatre axes fondamentaux pour la transformation portuaire.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            position: 'relative',
          }}>
            {pillars.map((p, i) => (
              <div key={i} className="pillar-card" style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.09)',
                overflow: 'hidden',
                transition: '0.3s',
              }}>
                <div style={{ height: '150px', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
                </div>
                <div style={{ padding: '22px' }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.3px' }}>
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
        .hover-img:hover img { transform: scale(1.06); }

        /* Swap image au hover */
        .img-swap-card:hover .img-base {
          opacity: 0;
          transform: scale(1.05);
        }
        .img-swap-card:hover .img-hover {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
        .img-swap-card {
          cursor: pointer;
        }

        .card-feature:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 115, 244, 0.10);
          border-color: rgba(0,115,244,0.25) !important;
        }

        .pillar-card:hover {
          background: rgba(255,255,255,0.08) !important;
          transform: translateY(-4px);
        }

        /* Titre : une ligne sur desktop, wrap autorisé sur mobile */
        @media (max-width: 768px) {
          .about-title {
            white-space: normal !important;
            font-size: clamp(22px, 7vw, 34px) !important;
          }
        }

        /* Stats : 2 colonnes sur tablette, 2 sur mobile */
        @media (max-width: 900px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .stat-item {
            border-right: none !important;
            border-bottom: 1px solid #EDF2F7;
          }
          .stat-item:nth-child(odd) { border-right: 1px solid #EDF2F7 !important; }
          .stat-item:last-child, .stat-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
        }

        @media (max-width: 540px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          #about { padding-left: 0; padding-right: 0; }
        }
      `}</style>
    </section>
  )
}

export default About