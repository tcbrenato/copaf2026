import React from 'react'
import {
  Mic, GraduationCap, Handshake, Ship,
  Landmark, BarChart3, Laptop, Settings,
  Anchor, Microscope, Compass, Globe,
} from 'lucide-react'

const STATS = [
  { number: '200+', label: 'Participants Attendus' },
  { number: '54',   label: 'Nations Africaines' },
  { number: '50+',  label: 'Conférenciers Experts' },
  { number: '3',    label: 'Jours Intensifs' },
]

const OBJECTIFS = [
  {
    num: '01',
    title: 'Partager l\'Expertise de Haut Niveau',
    desc: 'Institutionnaliser une plateforme d\'échange sur les meilleures pratiques et accroître la performance des cadres portuaires africains.',
  },
  {
    num: '02',
    title: 'Renforcer le Réseau Décisionnel',
    desc: 'Fédérer les leaders et décideurs maritimes africains pour favoriser la synergie continentale et l\'émergence de partenariats stratégiques durables.',
  },
  {
    num: '03',
    title: 'Vivre une Immersion Technologique et Opérationnelle',
    desc: 'Découvrir par l\'exemple les solutions concrètes en matière de Smart Port, d\'IA et d\'automatisation logistique.',
  },
  {
    num: '04',
    title: 'Accélérer la Compétitivité Continentale',
    desc: 'Transformer les acquis techniques et relationnels en leviers de croissance pour porter la part de l\'Afrique dans le commerce maritime mondial.',
  },
]

const FORMATS = [
  {
    icon: Mic,
    title: 'Conférences Plénières',
    desc: 'Keynotes d\'experts internationaux sur la digitalisation, l\'IA et la cybersécurité portuaire.',
  },
  {
    icon: GraduationCap,
    title: 'Sessions de Formation Immersive',
    desc: 'Ateliers techniques pour les cadres et directeurs, alliant théorie et études de cas portuaires appliquées.',
  },
  {
    icon: Handshake,
    title: 'Networking & B2B',
    desc: 'Espaces dédiés aux échanges entre acteurs portuaires et fournisseurs de solutions technologiques.',
  },
  {
    icon: Ship,
    title: 'Visites de Terrain',
    desc: 'Immersion guidée dans les installations d\'un premier hub portuaire pour s\'approprier les solutions Smart Port.',
  },
]

const PUBLIC = [
  { icon: Landmark,    role: 'Directeurs Généraux', sub: 'Autorités Portuaires', tag: 'Leadership stratégique' },
  { icon: BarChart3,   role: 'Directeurs Stratégie', sub: 'et Développement', tag: 'Planification & gouvernance' },
  { icon: Laptop,      role: 'DSI', sub: 'Systèmes d\'Information', tag: 'Transformation digitale' },
  { icon: Settings,    role: 'Responsables Terminaux', sub: 'et Opérations', tag: 'Excellence opérationnelle' },
  { icon: Anchor,      role: 'La Capitainerie', sub: 'Sécurité maritime', tag: 'Réglementation & sûreté' },
  { icon: Microscope,  role: 'Responsables Innovation', sub: 'et Technologie', tag: 'Déploiement Smart Port' },
  { icon: Compass,     role: 'Autres Directeurs', sub: 'et Cadres Portuaires', tag: 'Pilotage opérationnel' },
  { icon: Globe,       role: 'Acteurs du Secteur', sub: 'Portuaire et Paraportuaire', tag: 'Écosystème logistique' },
]

const About = () => {
  return (
    <section id="about" style={{
      padding: 'clamp(60px, 10vw, 120px) 0',
      background: '#f9fafb',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* SVG réseau en fond */}
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
        ].map(([x1,y1,x2,y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.35" />
        ))}
        {[
          [80,100],[320,70],[560,180],[760,80],[1000,160],[1220,70],
          [180,300],[340,380],[500,300],[660,360],[820,420],[1000,340],
          [260,520],[420,600],[580,520],[740,620],[900,540],[1060,620],
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 5 === 0 ? 5 : 3} fill={i % 7 === 0 ? '#0073F4' : '#818cf8'} opacity="0.45" />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(249,250,251,0.82)', zIndex: 1 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(50px, 8vw, 80px)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(0,115,244,0.08)', border: '1px solid rgba(0,115,244,0.2)',
            borderRadius: '100px', padding: '6px 20px', marginBottom: '24px',
          }}>
            <div style={{ width: 8, height: 8, background: '#0073F4', borderRadius: '50%' }} />
            <span style={{ color: '#0073F4', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Vision Stratégique 2026
            </span>
          </div>

          <h2 className="about-title" style={{
            fontSize: 'clamp(26px, 4.5vw, 52px)',
            fontWeight: 900, color: '#000E91',
            marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            La Conférence des{' '}
            <span style={{ color: '#0073F4' }}>Ports Africains</span>
          </h2>

          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)', color: '#4A5568',
            maxWidth: '680px', margin: '0 auto', lineHeight: 1.75,
          }}>
            Propulser la part des ports africains{' '}
            <strong style={{ color: '#000E91' }}>au-delà de 3 %</strong> dans le commerce
            mondial d'ici 2030 : telle est l'ambition de la COPAF. En s'appuyant sur le
            modèle Smart Port et la digitalisation, l'événement érige la performance
            opérationnelle en levier de souveraineté et de résilience pour le continent.
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="stats-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 15px 50px rgba(0,14,145,0.07)',
          marginBottom: 'clamp(60px, 8vw, 100px)',
          border: '1px solid rgba(0,14,145,0.07)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-item" style={{
              padding: 'clamp(30px, 5vw, 50px) 20px',
              textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid #EDF2F7' : 'none',
            }}>
              <div style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 900, color: '#0073F4', marginBottom: '8px' }}>
                {s.number}
              </div>
              <div style={{ fontSize: '11px', color: '#718096', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── OBJECTIFS ── */}
        <div style={{ marginBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#000E91', marginBottom: '12px' }}>
              Objectifs de la Conférence
            </h3>
            <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>
              Quatre ambitions au service de la performance portuaire africaine.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {OBJECTIFS.map((o, i) => (
              <div key={i} className="card-feature" style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                padding: 'clamp(28px, 3.5vw, 40px)',
                borderRadius: '20px',
                border: '1px solid rgba(0,14,145,0.07)',
                transition: 'all 0.35s ease',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: 'clamp(48px, 6vw, 72px)',
                  fontWeight: 900,
                  color: 'rgba(0,115,244,0.07)',
                  position: 'absolute',
                  top: '-8px', right: '16px',
                  lineHeight: 1,
                  userSelect: 'none',
                }}>
                  {o.num}
                </div>
                <div style={{ width: '36px', height: '3px', background: '#0073F4', borderRadius: '2px', marginBottom: '20px' }} />
                <h4 style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', fontWeight: 800, color: '#000E91', marginBottom: '12px', lineHeight: 1.3 }}>
                  {o.title}
                </h4>
                <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                  {o.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORMATS ── */}
        <div style={{ marginBottom: 'clamp(60px, 8vw, 100px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#000E91', marginBottom: '12px' }}>
              Grands Axes de la Conférence
            </h3>
            <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>
              Des formats variés pour une expérience immersive et opérationnelle.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {FORMATS.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="card-feature" style={{
                  background: 'rgba(255,255,255,0.95)',
                  padding: 'clamp(24px, 3vw, 36px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,14,145,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.35s ease',
                }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: 'rgba(0,115,244,0.08)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color="#0073F4" strokeWidth={2} />
                  </div>
                  <h4 style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', fontWeight: 800, color: '#000E91', margin: 0 }}>
                    {f.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#4A5568', lineHeight: 1.7, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── PUBLIC CIBLE ── */}
        <div style={{
          background: '#000E91',
          borderRadius: '32px',
          padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 60px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(0,115,244,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '250px', height: '250px', background: 'rgba(0,115,244,0.08)', borderRadius: '50%', filter: 'blur(60px)' }} />

          <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative' }}>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>
              Public <span style={{ color: '#4DA6FF' }}>Cible</span>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px, 1.4vw, 16px)', margin: 0 }}>
              Un événement conçu pour les décideurs et experts du secteur portuaire.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            position: 'relative',
          }}>
            {PUBLIC.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className="pillar-card" style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.09)',
                  padding: 'clamp(20px, 2.5vw, 28px)',
                  transition: '0.3s',
                }}>
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'rgba(0,115,244,0.2)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '14px',
                  }}>
                    <Icon size={18} color="#4DA6FF" strokeWidth={2} />
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, marginBottom: '4px', lineHeight: 1.3 }}>
                    {p.role}
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '0 0 12px' }}>
                    {p.sub}
                  </p>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    color: '#4DA6FF',
                    background: 'rgba(0,115,244,0.15)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                    letterSpacing: '0.3px',
                  }}>
                    {p.tag}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <style>{`
        .card-feature:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,115,244,0.10);
          border-color: rgba(0,115,244,0.22) !important;
        }
        .pillar-card:hover {
          background: rgba(255,255,255,0.09) !important;
          transform: translateY(-3px);
        }
        @media (max-width: 768px) {
          .about-title { white-space: normal !important; }
        }
        @media (max-width: 900px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .stat-item { border-right: none !important; border-bottom: 1px solid #EDF2F7; }
          .stat-item:nth-child(odd) { border-right: 1px solid #EDF2F7 !important; }
          .stat-item:last-child, .stat-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
        }
        @media (max-width: 540px) {
          .stats-container { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}

export default About