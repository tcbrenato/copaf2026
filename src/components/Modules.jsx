const Modules = () => {
  const modules = [
    {
      num: '01',
      titre: 'Vision Stratégique & Smart Port',
      icon: '🧭',
      items: [
        'L\'IA comme levier de compétitivité dans la sous-région',
        'Benchmarks mondiaux : Tanger Med, Singapour, Rotterdam',
        'Élaboration d\'une feuille de route digitale souveraine',
      ]
    },
    {
      num: '02',
      titre: 'Optimisation de la Chaîne Logistique',
      icon: '⚙️',
      items: [
        'IA Prédictive : anticiper l\'arrivée des navires (Berth Planning)',
        'Gestion des Terminaux (TOS) : rangement intelligent des conteneurs',
        'Maintenance Prédictive par analyse vibratoire et thermique',
      ]
    },
    {
      num: '03',
      titre: 'IA, Sûreté & Facilitation du Commerce',
      icon: '🔐',
      items: [
        'Automatisation des Douanes : vision par ordinateur pour scanners',
        'Fluidification de l\'Hinterland : rendez-vous camions intelligents',
        'Cyber sécurité : protéger les infrastructures critiques',
      ]
    },
    {
      num: '04',
      titre: 'Transition Énergétique & Port Vert',
      icon: '🌿',
      items: [
        'IA pour optimiser la consommation énergétique des terminaux',
        'Gestion intelligente des déchets portuaires',
        'Suivi de l\'empreinte carbone en temps réel',
      ]
    },
  ]

  const objectifs = [
    { num: '01', text: 'Comprendre les fondamentaux de l\'IA et de la data science' },
    { num: '02', text: 'Concevoir et structurer un projet IA adapté à la gestion portuaire' },
    { num: '03', text: 'Utiliser les données prédictives pour anticiper les flux' },
    { num: '04', text: 'Intégrer l\'IA dans la gestion opérationnelle' },
    { num: '05', text: 'Identifier les gisements de productivité (temps d\'attente, maintenance)' },
    { num: '06', text: 'Maîtriser la gouvernance de la donnée et la cyber sécurité' },
    { num: '07', text: 'Positionner le port comme maillon performant des corridors africains' },
  ]

  return (
    <section id="modules" style={{
      padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px)',
      background: 'linear-gradient(180deg, #000a6e 0%, #000e91 100%)',
      color: '#FFFFFF',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 8vw, 80px)' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 100, padding: '8px 24px', marginBottom: 24
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Programme Académique
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 700,
          lineHeight: 1.1, marginBottom: 20
        }}>
          4 Modules de <span style={{ color: '#0073f4' }}>Formation</span>
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.8
        }}>
          Un cursus intensif conçu spécifiquement pour répondre aux défis technologiques des ports africains.
        </p>
      </div>

      {/* Modules Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'clamp(16px, 3vw, 30px)',
        maxWidth: 1200,
        margin: '0 auto',
        marginBottom: 'clamp(48px, 8vw, 80px)',
      }}>
        {modules.map((m, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: 'clamp(28px, 5vw, 48px)',
            transition: 'all 0.4s ease',
            position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.borderColor = '#0073f4'
              e.currentTarget.style.transform = 'translateY(-5px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Numéro de fond stylisé */}
            <div style={{
              position: 'absolute', top: -15, right: 15,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(80px, 12vw, 120px)',
              fontWeight: 900, color: 'rgba(0,115,244,0.1)',
              lineHeight: 1, pointerEvents: 'none', userSelect: 'none'
            }}>
              {m.num}
            </div>

            <div style={{ fontSize: 'clamp(32px, 6vw, 44px)', marginBottom: 20 }}>{m.icon}</div>
            <div style={{
              fontSize: 12, color: '#0073f4', fontWeight: 800,
              letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12
            }}>
              Module {m.num}
            </div>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(20px, 3.5vw, 28px)',
              fontWeight: 700, marginBottom: 24, lineHeight: 1.2
            }}>
              {m.titre}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {m.items.map((item, j) => (
                <li key={j} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  fontSize: 'clamp(13px, 1.8vw, 15px)',
                  color: 'rgba(255,255,255,0.7)', lineHeight: 1.6
                }}>
                  <span style={{ color: '#0073f4', fontSize: 12, marginTop: 4, flexShrink: 0 }}>◆</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Objectifs Section */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'clamp(16px, 4vw, 30px)',
        padding: 'clamp(32px, 6vw, 60px)',
        color: '#000e91',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
        maxWidth: 1100, margin: '0 auto'
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          marginBottom: 'clamp(24px, 5vw, 40px)',
          textAlign: 'center'
        }}>
          Objectifs de la <span style={{ color: '#0073f4' }}>Formation</span>
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(12px, 2.5vw, 24px)'
        }}>
          {objectifs.map((o, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              padding: 'clamp(12px, 2.5vw, 15px)',
              background: '#F8FAFC', borderRadius: 12,
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                background: '#0073f4', color: '#fff',
                borderRadius: 8, width: 32, height: 32,
                minWidth: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, flexShrink: 0
              }}>
                {o.num}
              </div>
              <div style={{
                fontSize: 'clamp(13px, 1.8vw, 15px)',
                color: '#334155', fontWeight: 500, lineHeight: 1.5
              }}>
                {o.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div style={{
        marginTop: 'clamp(36px, 6vw, 60px)',
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(16px, 3vw, 30px)',
        flexWrap: 'wrap',
        padding: '0 4px',
      }}>
        {[
          { icon: '🎓', titre: 'Digital & Numeric Academy', desc: 'Certification Internationale' },
          { icon: '🏅', titre: 'CRF Perfection', desc: 'Expertise Panafricaine' },
        ].map((c, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(0,115,244,0.3)',
            borderRadius: 20,
            padding: 'clamp(18px, 3vw, 24px) clamp(20px, 4vw, 32px)',
            display: 'flex', alignItems: 'center', gap: 'clamp(14px, 3vw, 20px)',
            width: '100%',
            maxWidth: 380,
          }}>
            <span style={{ fontSize: 'clamp(28px, 6vw, 40px)', flexShrink: 0 }}>{c.icon}</span>
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: 'clamp(14px, 2.5vw, 17px)',
                color: '#FFFFFF'
              }}>
                {c.titre}
              </div>
              <div style={{
                fontSize: 13, color: '#0073f4', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 1
              }}>
                {c.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

export default Modules