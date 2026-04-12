import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STANDS = [
  {
    id: 1,
    company: 'Tanger Med Port Authority',
    acronym: 'TMPA',
    country: 'Maroc',
    flag: 'MA',
    sector: 'Autorité Portuaire',
    tagline: 'Le port le plus connecté d\'Afrique',
    description: 'Tanger Med Port Authority présente sa plateforme IA de gestion prédictive des flux de conteneurs, réduisant les temps d\'attente de 38 % grâce au machine learning appliqué aux données AIS en temps réel.',
    products: ['Plateforme Smart Gate AI', 'Monitoring IoT des quais', 'Dashboard de prédiction d\'escale'],
    contact: { email: 'digital@tangermed.ma', phone: '+212 539 39 39 39', web: 'tangermed.ma' },
    slots: ['10h00', '14h00', '16h30'],
    category: 'Port',
    verified: true,
  },
  {
    id: 2,
    company: 'Portnet S.A.',
    acronym: 'PN',
    country: 'Maroc',
    flag: 'MA',
    sector: 'Guichet Unique Maritime',
    tagline: 'La digitalisation des procédures portuaires marocaines',
    description: 'Portnet déploie la deuxième génération de son guichet unique dématérialisé, intégrant des workflows IA pour la validation automatique des manifestes et la gestion prédictive des inspections douanières.',
    products: ['Guichet Unique v2.0', 'Module IA de contrôle documentaire', 'API douane & commerce extérieur'],
    contact: { email: 'info@portnet.ma', phone: '+212 522 36 00 00', web: 'portnet.ma' },
    slots: ['09h30', '13h00', '15h30'],
    category: 'Technologie',
    verified: true,
  },
  {
    id: 3,
    company: 'Dakar Terminal',
    acronym: 'DT',
    country: 'Sénégal',
    flag: 'SN',
    sector: 'Terminal à Conteneurs',
    tagline: 'Smart Port Gateway — Afrique de l\'Ouest',
    description: 'Dakar Terminal expose sa solution de jumeau numérique (digital twin) du terminal, permettant une simulation en temps réel des opérations et une planification optimisée des ressources humaines et matérielles.',
    products: ['Digital Twin Terminal', 'Optimiseur d\'allocation grues & RTG', 'Portail shipper 360°'],
    contact: { email: 'digital@dakarterminal.sn', phone: '+221 33 849 45 00', web: 'dakarterminal.sn' },
    slots: ['11h00', '15h00'],
    category: 'Terminal',
    verified: true,
  },
  {
    id: 4,
    company: 'Marseille Fos Port',
    acronym: 'MFP',
    country: 'France',
    flag: 'FR',
    sector: 'Grand Port Maritime',
    tagline: 'Le corridor méditerranéen digitalisé',
    description: 'Le Grand Port Maritime de Marseille présente son programme Smart Port 2030 : infrastructure IoT unifiée, plateforme de données partagées inter-acteurs et solutions de décarbonation instrumentées par l\'intelligence artificielle.',
    products: ['Programme Smart Port 2030', 'Hub de données portuaires mutualisées', 'Suivi CO₂ en temps réel'],
    contact: { email: 'innovation@marseille-port.fr', phone: '+33 4 91 39 40 00', web: 'marseille-port.fr' },
    slots: ['10h30', '14h30', '17h00'],
    category: 'Port',
    verified: true,
  },
  {
    id: 5,
    company: 'Gulftainer Technologies',
    acronym: 'GT',
    country: 'Émirats Arabes Unis',
    flag: 'AE',
    sector: 'Opérateur de Terminal',
    tagline: 'Automation & IA au service des terminaux du Golfe',
    description: 'Gulftainer Technologies expose ses solutions d\'automatisation de terminaux : grues automatisées pilotées par IA, véhicules autonomes guidés (AGV) et systèmes de gestion de yard nouvelle génération.',
    products: ['Grue RTG automatisée IA', 'Système AGV intelligent', 'TOS NextGen avec ML embarqué'],
    contact: { email: 'tech@gulftainer.com', phone: '+971 6 526 2626', web: 'gulftainer.com' },
    slots: ['09h00', '12h00', '16h00'],
    category: 'Technologie',
    verified: false,
  },
  {
    id: 6,
    company: 'Abidjan Terminal',
    acronym: 'AT',
    country: 'Côte d\'Ivoire',
    flag: 'CI',
    sector: 'Terminal à Conteneurs',
    tagline: 'Le hub numérique de l\'Afrique de l\'Ouest',
    description: 'Abidjan Terminal présente sa transformation digitale : déploiement d\'un TOS intégré, connectivité API avec les lignes maritimes et son programme de formation aux outils numériques pour les dockers et officiers de port.',
    products: ['TOS Integra Cloud', 'Portail shipper & transitaire', 'Programme Digital Talent Port'],
    contact: { email: 'innovation@abidjan-terminal.ci', phone: '+225 27 23 23 00 00', web: 'abidjan-terminal.ci' },
    slots: ['11h30', '15h30'],
    category: 'Terminal',
    verified: false,
  },
]

const CATEGORIES = ['Tous', 'Port', 'Terminal', 'Technologie']
const FLAGS = { MA: '🇲🇦', SN: '🇸🇳', FR: '🇫🇷', AE: '🇦🇪', CI: '🇨🇮' }
const CAT = {
  Port:        { accent: '#000E91', bg: '#EEF0FF' },
  Terminal:    { accent: '#0D7A5F', bg: '#EDFAF5' },
  Technologie: { accent: '#92400E', bg: '#FEF6E4' },
}

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Svg = ({ children, size = 15, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill ? 'currentColor' : 'none'}
    stroke={fill ? 'none' : 'currentColor'}
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const IcoMail   = () => <Svg><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Svg>
const IcoPhone  = () => <Svg><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.36a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>
const IcoGlobe  = () => <Svg><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Svg>
const IcoClock  = () => <Svg><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>
const IcoVideo  = () => <Svg><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></Svg>
const IcoCheck  = () => <Svg><polyline points="20 6 9 17 4 12"/></Svg>
const IcoShield = () => <Svg fill><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>
const IcoClose  = () => <Svg size={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>
const IcoArrow  = () => <Svg size={13}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>

// ─── MODAL ────────────────────────────────────────────────────────────────────

const Modal = ({ stand, onClose }) => {
  const c = CAT[stand.category] || CAT.Port

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const fn = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', fn) }
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(5,10,50,0.65)',
      backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 40px 80px rgba(0,14,145,0.2)',
        animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* ── Modal header ── */}
        <div style={{ padding: '32px 36px 28px', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 20, right: 20,
            width: 34, height: 34, borderRadius: 8,
            background: '#F5F5F5', border: 'none',
            cursor: 'pointer', color: '#999',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IcoClose />
          </button>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: c.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff',
              fontFamily: "'Syne', sans-serif",
            }}>
              {stand.acronym}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                <h2 style={{
                  margin: 0, fontSize: 20, fontWeight: 700, color: '#0A0A0A',
                  fontFamily: "'Syne', sans-serif", lineHeight: 1.2,
                }}>
                  {stand.company}
                </h2>
                {stand.verified && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: c.bg, color: c.accent,
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                    padding: '3px 8px', borderRadius: 5, textTransform: 'uppercase',
                  }}>
                    <IcoShield /> Vérifié
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#AAA', fontWeight: 500 }}>
                {FLAGS[stand.flag]} {stand.country} &nbsp;·&nbsp; {stand.sector}
              </p>
            </div>
          </div>

          <p style={{
            margin: 0, fontSize: 14, color: '#555', lineHeight: 1.75,
            fontFamily: "'Lora', Georgia, serif",
            paddingTop: 18, borderTop: '1px solid #F0F0F0',
          }}>
            {stand.description}
          </p>
        </div>

        {/* ── Modal body ── */}
        <div style={{ padding: '0 36px 32px' }}>

          <Label>Solutions présentées</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
            {stand.products.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: '#FAFAFA', border: '1px solid #F0F0F0',
              }}>
                <span style={{ color: c.accent, flexShrink: 0 }}><IcoCheck /></span>
                <span style={{ fontSize: 13, color: '#222', fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>

          <Label>Créneaux de démonstration</Label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 24 }}>
            {stand.slots.map((s, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 13px', borderRadius: 7,
                border: `1.5px solid ${c.accent}`,
                color: c.accent, fontSize: 12, fontWeight: 700,
                cursor: 'default', transition: 'all 0.15s',
              }}>
                <IcoClock /> {s}
              </span>
            ))}
          </div>

          <Label>Contact</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
            {[
              { icon: <IcoMail />,  val: stand.contact.email, href: `mailto:${stand.contact.email}` },
              { icon: <IcoPhone />, val: stand.contact.phone,  href: `tel:${stand.contact.phone}` },
              { icon: <IcoGlobe />, val: stand.contact.web,    href: `https://${stand.contact.web}`, ext: true },
            ].map((r, i) => (
              <a key={i} href={r.href} target={r.ext ? '_blank' : undefined} rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid #EBEBEB', textDecoration: 'none',
                color: '#555', fontSize: 13, fontWeight: 500,
                transition: 'border-color 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.accent }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.color = '#555' }}
              >
                <span style={{ opacity: 0.45, display: 'flex' }}>{r.icon}</span> {r.val}
              </a>
            ))}
          </div>

          <button style={{
            width: '100%', padding: '14px', borderRadius: 10,
            background: c.accent, color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontWeight: 700, fontSize: 12, letterSpacing: 1.2,
            textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: "'Syne', sans-serif", transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <IcoVideo /> Rejoindre la démonstration live
          </button>
        </div>
      </div>
    </div>
  )
}

const Label = ({ children }) => (
  <p style={{
    margin: '0 0 10px', fontSize: 10, fontWeight: 700,
    letterSpacing: 1.8, textTransform: 'uppercase', color: '#C0C0C0',
  }}>
    {children}
  </p>
)

// ─── CARD ─────────────────────────────────────────────────────────────────────

const Card = ({ stand, onOpen, idx }) => {
  const [hov, setHov] = useState(false)
  const c = CAT[stand.category] || CAT.Port

  return (
    <article
      onClick={() => onOpen(stand)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', borderRadius: 14, cursor: 'pointer',
        border: `1.5px solid ${hov ? c.accent : '#EBEBEB'}`,
        padding: '26px 28px',
        boxShadow: hov ? `0 12px 36px -6px ${c.accent}20` : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        animation: `cardIn 0.4s ${idx * 55}ms ease both`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 11, flexShrink: 0,
          background: hov ? c.accent : c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800,
          color: hov ? '#fff' : c.accent,
          fontFamily: "'Syne', sans-serif",
          transition: 'all 0.22s',
        }}>
          {stand.acronym}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
          textTransform: 'uppercase', padding: '4px 9px',
          borderRadius: 5, background: c.bg, color: c.accent,
        }}>
          {stand.category}
        </span>
      </div>

      {/* Company */}
      <h3 style={{
        margin: '0 0 3px', fontSize: 15, fontWeight: 700,
        color: '#0A0A0A', lineHeight: 1.3,
        fontFamily: "'Syne', sans-serif",
      }}>
        {stand.company}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 11, color: '#ADADAD', fontWeight: 500 }}>
        {FLAGS[stand.flag]} {stand.country} &nbsp;·&nbsp; {stand.sector}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: '#F3F3F3', marginBottom: 16 }} />

      {/* Tagline */}
      <p style={{
        margin: '0 0 18px', fontSize: 13, color: '#666', lineHeight: 1.65,
        fontFamily: "'Lora', Georgia, serif", flexGrow: 1,
      }}>
        {stand.tagline}
      </p>

      {/* Slots */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 18 }}>
        {stand.slots.map((s, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: '#999',
            background: '#F7F7F7', padding: '4px 8px', borderRadius: 5,
          }}>
            <IcoClock /> {s}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: '1px solid #F3F3F3',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 600,
          color: stand.verified ? c.accent : '#CCC',
        }}>
          {stand.verified
            ? <><IcoShield /> Exposant vérifié</>
            : <span style={{ color: '#CCC', fontSize: 10 }}>{stand.contact.web}</span>
          }
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: hov ? c.accent : '#D0D0D0',
          transition: 'color 0.2s',
        }}>
          Voir <IcoArrow />
        </span>
      </div>
    </article>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function VisiterExposition() {
  const [cat, setCat]         = useState('Tous')
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const filtered = STANDS.filter(s =>
    (cat === 'Tous' || s.category === cat) &&
    [s.company, s.country, s.sector, s.tagline].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Lora:ital,wght@0,400;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        .vi-input::placeholder { color: #C8C8C8; }
        .vi-input:focus { outline: none; border-color: #000E91 !important; }
        .vi-cat:hover   { border-color: #000E91 !important; color: #000E91 !important; }

        @media (max-width: 680px) {
          .vi-grid  { grid-template-columns: 1fr !important; }
          .vi-h1    { font-size: 38px !important; }
          .vi-stats { gap: 28px !important; }
          .vi-bar   { flex-direction: column !important; align-items: stretch !important; }
          .vi-cats  { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section style={{
        background: '#000E91',
        paddingTop: 130, paddingBottom: 96,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* dot texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        {/* glow */}
        <div style={{
          position: 'absolute', right: -100, top: '40%', transform: 'translateY(-50%)',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,115,244,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          {/* breadcrumb */}
          <div style={{
            marginBottom: 40,
            display: 'flex', gap: 8, alignItems: 'center',
            fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            animation: 'heroFade 0.45s ease both',
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              onClick={() => navigate('/')}>
              Accueil
            </span>
            <span style={{ opacity: 0.3 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Exposition Digitale</span>
          </div>

          {/* live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 100, padding: '6px 14px 6px 10px',
            animation: 'heroFade 0.45s 0.04s ease both',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#22C55E',
              animation: 'pulse 2.2s ease infinite',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
              En direct — COPAF 2026
            </span>
          </div>

          <h1 className="vi-h1" style={{
            margin: '0 0 16px', fontSize: 58, fontWeight: 800,
            color: '#fff', lineHeight: 1.05,
            fontFamily: "'Syne', sans-serif", letterSpacing: -1.5,
            animation: 'heroFade 0.45s 0.08s ease both',
          }}>
            Stands<br />
            <span style={{ color: '#0073F4' }}>Digitaux</span>
          </h1>

          <p style={{
            margin: '0 0 52px', fontSize: 16, color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.8, maxWidth: 460,
            fontFamily: "'DM Sans', sans-serif",
            animation: 'heroFade 0.45s 0.12s ease both',
          }}>
            Découvrez les solutions présentées par les acteurs du smart port, de la digitalisation portuaire et de l'IA maritime.
          </p>

          {/* stats */}
          <div className="vi-stats" style={{
            display: 'flex', gap: 52,
            animation: 'heroFade 0.45s 0.16s ease both',
          }}>
            {[
              [STANDS.length, 'Exposants'],
              [STANDS.filter(s => s.verified).length, 'Vérifiés'],
              [STANDS.reduce((a, s) => a + s.slots.length, 0), 'Sessions live'],
            ].map(([n, l], i) => (
              <div key={i}>
                <div style={{
                  fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1,
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {n}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
                  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginTop: 5,
                }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #EBEBEB',
        position: 'sticky', top: 68, zIndex: 200,
      }}>
        <div className="vi-bar" style={{
          maxWidth: 1080, margin: '0 auto', padding: '13px 32px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#D0D0D0' }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="vi-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                width: '100%', padding: '9px 12px 9px 34px',
                border: '1.5px solid #EBEBEB', borderRadius: 8,
                fontSize: 13, color: '#222',
                fontFamily: "'DM Sans', sans-serif",
                background: '#FAFAFA', transition: 'border-color 0.18s',
              }}
            />
          </div>

          <div className="vi-cats" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {CATEGORIES.map(c => (
              <button key={c} className="vi-cat" onClick={() => setCat(c)} style={{
                padding: '7px 15px', borderRadius: 7,
                border: '1.5px solid',
                borderColor: cat === c ? '#000E91' : '#EBEBEB',
                background: cat === c ? '#000E91' : '#fff',
                color: cat === c ? '#fff' : '#999',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
                textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: "'Syne', sans-serif",
                transition: 'all 0.16s',
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── GRID ─── */}
      <main style={{ background: '#F7F7F7', padding: '52px 32px 96px', minHeight: '50vh' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#C0C0C0',
            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 28,
          }}>
            {filtered.length} exposant{filtered.length !== 1 ? 's' : ''}
          </p>

          {filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: '80px 0', color: '#CCC' }}>
                <p style={{ fontSize: 15, fontWeight: 600 }}>Aucun résultat pour cette recherche</p>
              </div>
            : <div className="vi-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: 18,
              }}>
                {filtered.map((s, i) => <Card key={s.id} stand={s} idx={i} onOpen={setSelected} />)}
              </div>
          }
        </div>
      </main>

      {/* ─── CTA ─── */}
      <section style={{
        background: '#fff', borderTop: '1px solid #EBEBEB',
        padding: '72px 32px',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            margin: '0 0 12px', fontSize: 30, fontWeight: 800,
            color: '#0A0A0A', fontFamily: "'Syne', sans-serif",
            letterSpacing: -0.5, lineHeight: 1.2,
          }}>
            Exposer votre organisation ?
          </h2>
          <p style={{
            margin: '0 0 32px', fontSize: 14, color: '#999', lineHeight: 1.75,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Rejoignez les exposants de COPAF 2026 et présentez vos solutions sans contrainte géographique.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/exposition-digitale')} style={{
              padding: '12px 26px', borderRadius: 9,
              background: '#000E91', color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", transition: 'opacity 0.18s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Réserver mon stand
            </button>
            <button onClick={() => navigate('/')} style={{
              padding: '12px 26px', borderRadius: 9,
              background: 'transparent', color: '#000E91',
              border: '1.5px solid #000E91',
              fontWeight: 700, fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#000E91'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000E91' }}
            >
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {selected && <Modal stand={selected} onClose={() => setSelected(null)} />}
    </>
  )
}