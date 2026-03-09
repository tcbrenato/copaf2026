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
      padding: '120px 60px',
      background: 'linear-gradient(180deg, #000a6e 0%, #000e91 100%)', // Ton bleu en background
      color: '#FFFFFF'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255, 255, 255, 0.1)', 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 100, padding: '8px 24px', marginBottom: 24
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Programme Académique
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20
        }}>
          4 Modules de <span style={{ color: '#0073f4' }}>Formation</span>
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
          Un cursus intensif conçu spécifiquement pour répondre aux défis technologiques des ports africains.
        </p>
      </div>

      {/* Modules Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 30, 
        marginBottom: 80,
        maxWidth: 1200,
        margin: '0 auto 80px auto'
      }}>
        {modules.map((m, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24, padding: 48,
            transition: 'all 0.4s ease',
            position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(10px)'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'
              e.currentTarget.style.borderColor = '#0073f4'
              e.currentTarget.style.transform = 'translateY(-5px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Numéro de fond stylisé */}
            <div style={{
              position: 'absolute', top: -15, right: 15,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 120, fontWeight: 900, color: 'rgba(0, 115, 244, 0.1)',
              lineHeight: 1, pointerEvents: 'none', userSelect: 'none'
            }}>
              {m.num}
            </div>

            <div style={{ fontSize: 44, marginBottom: 20 }}>{m.icon}</div>
            <div style={{ fontSize: 12, color: '#0073f4', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
              Module {m.num}
            </div>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 28, fontWeight: 700, marginBottom: 24, lineHeight: 1.2
            }}>
              {m.titre}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {m.items.map((item, j) => (
                <li key={j} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6
                }}>
                  <span style={{ color: '#0073f4', fontSize: 12, marginTop: 4 }}>◆</span>
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
        borderRadius: 30, padding: '60px',
        color: '#000e91',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
        maxWidth: 1100, margin: '0 auto'
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 36, fontWeight: 700, marginBottom: 40, textAlign: 'center'
        }}>
          Objectifs de la <span style={{ color: '#0073f4' }}>Formation</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {objectifs.map((o, i) => (
            <div key={i} style={{
              display: 'flex', gap: 20, alignItems: 'center', padding: '15px',
              background: '#F8FAFC', borderRadius: 12,
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                background: '#0073f4', color: '#fff',
                borderRadius: 8, width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, flexShrink: 0
              }}>
                {o.num}
              </div>
              <div style={{ fontSize: 15, color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>
                {o.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications - Style Badge */}
      <div style={{
        marginTop: 60, display: 'flex', justifyContent: 'center', gap: 30, flexWrap: 'wrap'
      }}>
        {[
          { icon: '🎓', titre: 'Digital & Numeric Academy', desc: 'Certification Internationale' },
          { icon: '🏅', titre: 'CRF Perfection', desc: 'Expertise Panafricaine' },
        ].map((c, i) => (
          <div key={i} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 115, 244, 0.3)',
            borderRadius: 20, padding: '24px 32px',
            display: 'flex', alignItems: 'center', gap: 20,
            minWidth: '340px'
          }}>
            <span style={{ fontSize: 40 }}>{c.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#FFFFFF' }}>{c.titre}</div>
              <div style={{ fontSize: 13, color: '#0073f4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Modules