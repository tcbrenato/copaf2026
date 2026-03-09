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
    { icon: '🌍', title: 'Rayonnement Continental', desc: 'Positionnez votre organisation au cœur de l\'écosystème portuaire africain.' },
    { icon: '🤖', title: 'Innovation & Transformation', desc: 'Digitalisation, IA et nouvelles technologies dans les opérations portuaires.' },
    { icon: '🏆', title: 'Excellence Opérationnelle', desc: 'Meilleures pratiques internationales et stratégies d\'optimisation.' },
    { icon: '📚', title: 'Formation Continue', desc: 'Ateliers pratiques et certifications pour le capital humain portuaire.' },
  ]

  return (
    <section id="about" style={{
      padding: '100px 60px',
      background: '#f8f9ff',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: 72 }}>
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
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
          color: '#000e91', marginBottom: 16, lineHeight: 1.15
        }}>
          La Conférence Officielle<br />
          <span style={{ color: '#0073f4' }}>des Ports Africains</span>
        </h2>
        <p style={{
          fontSize: 17, color: '#666',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.8, fontWeight: 300
        }}>
          Une plateforme d'échange stratégique réunissant décideurs portuaires,
          experts en formation et leaders africains pour façonner l'avenir du secteur.
        </p>
      </div>

      {/* ── STATS ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        marginBottom: 80, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 4px 40px rgba(0,14,145,0.08)',
        border: '1px solid rgba(0,115,244,0.12)',
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            padding: '44px 20px', textAlign: 'center',
            background: '#FFFFFF',
            borderRight: i < 3 ? '1px solid rgba(0,115,244,0.1)' : 'none',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <div style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 52, fontWeight: 900,
              color: '#0073f4', lineHeight: 1
            }}>
              {stat.number}
            </div>
            <div style={{
              fontSize: 12, color: '#999',
              letterSpacing: 2, textTransform: 'uppercase', marginTop: 10, fontWeight: 500
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24, marginBottom: 80
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,115,244,0.1)',
            borderRadius: 16, padding: 36,
            boxShadow: '0 2px 20px rgba(0,14,145,0.05)',
            transition: 'all 0.3s', cursor: 'default'
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
            {/* Icône dans cercle */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(0,115,244,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 20
            }}>
              {f.icon}
            </div>

            <h3 style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 19, fontWeight: 700,
              marginBottom: 12, color: '#000e91'
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: 20
            }}>
              {f.desc}
            </p>

            {/* Séparateur */}
            <div style={{ height: 1, background: 'rgba(0,115,244,0.08)', marginBottom: 16 }} />

            <ul style={{ listStyle: 'none' }}>
              {f.items.map((item, j) => (
                <li key={j} style={{
                  fontSize: 13, color: '#555',
                  padding: '5px 0', display: 'flex', alignItems: 'center', gap: 10
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
        padding: '60px 48px',
        boxShadow: '0 8px 48px rgba(0,14,145,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h3 style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 'clamp(22px, 3vw, 36px)',
            fontWeight: 900, color: '#FFFFFF', marginBottom: 10
          }}>
            Les Piliers de la <span style={{ color: '#0073f4' }}>COPAF 2026</span>
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>
            Quatre axes stratégiques pour transformer l'écosystème portuaire africain
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '28px 22px', textAlign: 'center',
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
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(0,115,244,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, margin: '0 auto 16px'
              }}>
                {p.icon}
              </div>
              <h4 style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: 15, fontWeight: 700,
                marginBottom: 10, color: '#FFFFFF'
              }}>
                {p.title}
              </h4>
              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.7, fontWeight: 300
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default About