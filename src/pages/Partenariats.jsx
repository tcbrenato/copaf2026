import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── DONNÉES ─────────────────────────────────────────────────────────────────

const SPONSORS = [
  {
    id: 'platine',
    label: 'Platine',
    emoji: '👑',
    price: '20 000 €',
    montant: 20000,
    badge: 'Niveau supérieur',
    color: '#7c3aed',
    light: '#f5f3ff',
    border: '#ddd6fe',
    avantages: [
      'Membre COPAF — accès conférences mondiales',
      'Logo officiel sur tous les supports',
      'Certificat de partenariat officiel',
      '4 tickets de participation inclus',
      'Branding sur tous les supports visuels',
      '1 page dans le magazine Recap COPAF',
      '2 publicités dans la newsletter COPAF',
      'Assistance en intelligence artificielle',
      'Exposé de 15 minutes pendant la conférence',
      'Distribution de prospectus sur site',
    ],
  },
  {
    id: 'or',
    label: 'Or',
    emoji: '⭐',
    price: '16 000 €',
    montant: 16000,
    badge: 'Très populaire',
    color: '#b45309',
    light: '#fffbeb',
    border: '#fcd34d',
    avantages: [
      'Membre COPAF — accès conférences mondiales',
      'Logo sur le site de la conférence',
      'Certificat de partenariat',
      '3 tickets de participation inclus',
      'Branding sur les supports visuels',
      '½ page dans le magazine Recap COPAF',
      '1 publicité dans la newsletter COPAF',
      'Exposé de 10 minutes pendant la conférence',
      'Distribution de prospectus sur site',
    ],
  },
  {
    id: 'argent',
    label: 'Argent',
    emoji: '🥈',
    price: '10 000 €',
    montant: 10000,
    badge: null,
    color: '#475569',
    light: '#f8fafc',
    border: '#cbd5e1',
    avantages: [
      'Membre COPAF — accès conférences mondiales',
      'Logo sur le site de la conférence',
      'Certificat de partenariat',
      '2 tickets de participation inclus',
      'Branding sur les supports visuels',
      '¼ page dans le magazine Recap COPAF',
      'Logo cité dans la newsletter COPAF',
      'Exposé de 5 minutes pendant la conférence',
    ],
  },
  {
    id: 'bronze',
    label: 'Bronze',
    emoji: '🥉',
    price: '8 000 €',
    montant: 8000,
    badge: null,
    color: '#92400e',
    light: '#fff7ed',
    border: '#fed7aa',
    avantages: [
      'Membre COPAF — accès conférences mondiales',
      'Logo sur le site de la conférence',
      'Certificat de partenariat',
      '1 ticket de participation inclus',
      'Branding sur les supports visuels',
      'Logo dans le magazine Recap COPAF',
      'Logo dans la newsletter COPAF',
    ],
  },
]

const PARTENAIRES = [
  {
    id: 'pso',
    label: 'Partenaire Stratégique Officiel',
    short: 'PSO',
    emoji: '🌟',
    price: '30 000 €',
    montant: 30000,
    badge: 'Niveau premium',
    color: '#000E91',
    light: '#eff6ff',
    border: '#bfdbfe',
    desc: "Le niveau d'engagement le plus élevé. Vous co-portez l'événement avec COPAF.",
    avantages: [
      "Membre officiel du comité d'organisation COPAF 2026",
      'Logo #1 premium sur tous les supports officiels',
      'Co-branding « COPAF × Votre organisation »',
      'Tribune officielle — prise de parole 20 minutes',
      '6 badges participants inclus',
      'Page dédiée premium sur le site COPAF',
      'Contenus prioritaires sur les tablettes',
      'Certificat de Partenariat Stratégique Officiel',
      'Accès complet aux données et résultats',
      'Partenariat reconductible pour éditions futures',
    ],
  },
  {
    id: 'ps',
    label: 'Partenaire Stratégique',
    short: 'PS',
    emoji: '🤝',
    price: '20 000 €',
    montant: 20000,
    badge: 'Partenariat associé',
    color: '#0073F4',
    light: '#eff6ff',
    border: '#93c5fd',
    desc: "S'associer officiellement à la COPAF 2026 avec une forte visibilité.",
    avantages: [
      'Logo sur tous les supports officiels',
      'Mention « Partenaire Stratégique » partout',
      'Prise de parole officielle — 10 minutes',
      '3 badges participants inclus',
      'Fiche dédiée sur le site COPAF',
      'Contenus sur les tablettes participants',
      'Certificat de Partenariat Stratégique',
      'Accès aux actes officiels de la conférence',
    ],
  },
]

const TYPES_INSTITUTION = [
  'Port / Autorité portuaire',
  'Ministère / Gouvernement',
  'Organisation régionale (AGPAOC, UA…)',
  'Organisme de financement',
  'Autre institution',
]

// ─── HELPERS BDD ─────────────────────────────────────────────────────────────

async function upsertContact({ email, nom, telephone, organisation, pays, source }) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert(
      { email, nom, telephone, organisation, pays, source },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createSponsorship({ contactId, type, niveau, montant, typeInstitution, message }) {
  const { error } = await supabase.from('sponsorships').insert([{
    contact_id:       contactId,
    type,
    niveau,
    montant,
    type_institution: typeInstitution || null,
    statut:           'nouveau',
    message,
  }])
  if (error) throw new Error(error.message)
}

// ─── HOOK RESPONSIVE ─────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

// ─── SOUS-COMPOSANTS ─────────────────────────────────────────────────────────

const CheckItem = ({ text, color }) => (
  <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
    <div style={{
      width:20, height:20, borderRadius:'50%',
      background: color + '18', border: `1.5px solid ${color}40`,
      display:'flex', alignItems:'center', justifyContent:'center',
      flexShrink:0, marginTop:1,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <polyline points="1.5 5 3.5 7.5 8.5 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <span style={{ fontSize:13.5, color:'#334155', lineHeight:1.6 }}>{text}</span>
  </div>
)

// Carte option (sponsor ou partenaire)
function OptionCard({ item, selected, onSelect, isMobile }) {
  const [open, setOpen] = useState(false)
  const isSelected = selected === item.id

  const handleClick = () => {
    onSelect(item.id)
    if (isMobile) setOpen(o => !o)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        background: isSelected ? item.light : '#fff',
        border: `2px solid ${isSelected ? item.color : '#e2e8f0'}`,
        borderRadius: 18,
        padding: isMobile ? '16px 14px' : '24px',
        cursor: 'pointer',
        transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
        transform: isSelected && !isMobile ? 'translateY(-4px)' : 'none',
        boxShadow: isSelected ? `0 12px 36px ${item.color}20` : '0 1px 4px rgba(0,0,0,.05)',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => { if (!isMobile && !isSelected) e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}18` }}
      onMouseLeave={e => { if (!isMobile && !isSelected) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}
    >
      {/* Barre colorée top */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:item.color, borderRadius:'16px 16px 0 0', opacity: isSelected ? 1 : 0.3 }} />

      {/* Check sélection desktop */}
      {isSelected && !isMobile && (
        <div style={{
          position:'absolute', top:14, right:14,
          width:24, height:24, borderRadius:'50%',
          background:item.color, display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginTop:8 }}>
        <div style={{ flex:1 }}>
          {item.badge && (
            <div style={{
              display:'inline-block',
              background: item.color + '15',
              border: `1px solid ${item.color}30`,
              borderRadius:100, padding:'2px 10px',
              fontSize:10, color:item.color, fontWeight:700,
              letterSpacing:.5, marginBottom:8,
            }}>
              {item.emoji} {item.badge}
            </div>
          )}
          <div style={{ fontSize:11, fontWeight:800, color:item.color, letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>
            {item.short || item.label}
          </div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:900, color:'#0f172a', letterSpacing:'-0.02em' }}>
            {item.price}
          </div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>participation unique</div>
        </div>

        {/* Flèche mobile */}
        {isMobile && (
          <div style={{
            width:32, height:32, borderRadius:'50%',
            background: isSelected ? item.color : '#f1f5f9',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, color: isSelected ? '#fff' : '#64748b',
            flexShrink:0,
            transition:'transform .25s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}>
            ▼
          </div>
        )}
      </div>

      {/* Détails */}
      {(!isMobile || open) && (
        <div style={{ marginTop:16 }}>
          {item.desc && (
            <p style={{ fontSize:13, color:'#64748b', marginBottom:14, lineHeight:1.65 }}>
              {item.desc}
            </p>
          )}
          <div style={{ height:1, background:'#f1f5f9', marginBottom:14 }} />
          {item.avantages.map((a, i) => (
            <CheckItem key={i} text={a} color={item.color} />
          ))}
        </div>
      )}
    </div>
  )
}

// Champ de formulaire
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function Partenariats() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const getInitialSection = () => {
    const p = new URLSearchParams(location.search)
    return p.get('type') === 'strategique' ? 'strategique' : 'sponsor'
  }

  const [activeSection,   setActiveSection]   = useState(getInitialSection)
  const [selectedOption,  setSelectedOption]  = useState(null)
  const [focused,         setFocused]         = useState('')

  // Sponsor form
  const [formSponsor,     setFormSponsor]     = useState({ organisation:'', contact:'', email:'', telephone:'', pays:'', message:'' })
  const [loadingSponsor,  setLoadingSponsor]  = useState(false)
  const [doneSponsor,     setDoneSponsor]     = useState(false)
  const [errorSponsor,    setErrorSponsor]    = useState('')

  // Partenaire form
  const [formStrat,       setFormStrat]       = useState({ organisation:'', type_institution:'', pays:'', contact:'', email:'', telephone:'', message:'' })
  const [loadingStrat,    setLoadingStrat]    = useState(false)
  const [doneStrat,       setDoneStrat]       = useState(false)
  const [errorStrat,      setErrorStrat]      = useState('')

  useEffect(() => {
    const p = new URLSearchParams(location.search)
    const t = p.get('type')
    if (t === 'strategique' || t === 'sponsor') {
      setActiveSection(t)
      setSelectedOption(null)
    }
  }, [location.search])

  const handleSectionChange = id => {
    setActiveSection(id)
    setSelectedOption(null)
    setErrorSponsor('')
    setErrorStrat('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Styles partagés
  const inputStyle = name => ({
    width:'100%', padding:'13px 16px',
    fontSize: isMobile ? 16 : 14,
    fontFamily:'inherit', color:'#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius:12, outline:'none',
    transition:'all .2s',
    boxSizing:'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance:'none', appearance:'none',
  })

  const foc = name => ({ onFocus:() => setFocused(name), onBlur:() => setFocused('') })

  // Submit sponsor
  const handleSubmitSponsor = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorSponsor('Veuillez sélectionner un niveau de sponsoring.'); return }
    setLoadingSponsor(true); setErrorSponsor('')
    try {
      const plan = SPONSORS.find(s => s.id === selectedOption)
      const contactId = await upsertContact({
        email:        formSponsor.email,
        nom:          formSponsor.contact,
        telephone:    formSponsor.telephone,
        organisation: formSponsor.organisation,
        pays:         formSponsor.pays,
        source:       'sponsor',
      })
      await createSponsorship({
        contactId,
        type:    'sponsor',
        niveau:  selectedOption,
        montant: plan?.montant || null,
        message: formSponsor.message,
      })
      setDoneSponsor(true)
    } catch (err) { setErrorSponsor('Erreur : ' + err.message) }
    setLoadingSponsor(false)
  }

  // Submit partenaire
  const handleSubmitStrat = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorStrat('Veuillez sélectionner un niveau de partenariat.'); return }
    setLoadingStrat(true); setErrorStrat('')
    try {
      const plan = PARTENAIRES.find(p => p.id === selectedOption)
      const contactId = await upsertContact({
        email:        formStrat.email,
        nom:          formStrat.contact,
        telephone:    formStrat.telephone,
        organisation: formStrat.organisation,
        pays:         formStrat.pays,
        source:       'partenaire',
      })
      await createSponsorship({
        contactId,
        type:            'partenaire_strategique',
        niveau:          selectedOption,
        montant:         plan?.montant || null,
        typeInstitution: formStrat.type_institution,
        message:         formStrat.message,
      })
      setDoneStrat(true)
    } catch (err) { setErrorStrat('Erreur : ' + err.message) }
    setLoadingStrat(false)
  }

  const selectedSponsor   = SPONSORS.find(s => s.id === selectedOption)
  const selectedPartenaire = PARTENAIRES.find(p => p.id === selectedOption)

  const SECTIONS = [
    { id:'sponsor',     emoji:'💎', label:'Sponsors',              desc:'Tarifs fixes, offres standardisées' },
    { id:'strategique', emoji:'🏛️', label:'Partenaires Stratégiques', desc:'Ports & institutions publiques' },
  ]

  return (
    <div style={{ background:'#f8faff', minHeight:'100vh', fontFamily:"'Plus Jakarta Sans', 'Helvetica Neue', sans-serif", color:'#0f172a' }}>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to   { transform:rotate(360deg); } }

        .fade-up { animation: fadeUp .5s ease both; }
        .spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; flex-shrink:0; }

        /* Grid cartes options */
        .options-grid-4 { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .options-grid-2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        @media (max-width:1000px) { .options-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:640px)  { .options-grid-4, .options-grid-2 { grid-template-columns:minmax(0,1fr); gap:10px; } }

        /* Grid formulaire 2 colonnes */
        .form-row-2 { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:14px; }
        @media (max-width:540px) { .form-row-2 { grid-template-columns:minmax(0,1fr); } }

        /* Tab buttons */
        .tab-btn { border:none; cursor:pointer; font-family:inherit; transition:all .25s; WebkitTapHighlightColor:transparent; }

        /* Submit button */
        .submit-btn {
          width:100%; padding:15px; border:none; border-radius:14px;
          color:#fff; font-family:inherit; font-weight:800; font-size:14px;
          cursor:pointer; transition:all .2s; letter-spacing:.3px;
          display:flex; align-items:center; justify-content:center; gap:10px;
        }
        .submit-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:.5; cursor:not-allowed; }

        @media (max-width:768px) { input, select, textarea { font-size:16px !important; } }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background:'linear-gradient(150deg,#000E91 0%,#0073F4 100%)',
        padding: isMobile ? '80px 20px 52px' : 'clamp(100px,14vw,160px) clamp(24px,5vw,64px) clamp(64px,8vw,110px)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        {/* Décors */}
        <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(0,0,0,.1)', pointerEvents:'none' }} />

        <div className="fade-up" style={{ position:'relative' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
            borderRadius:100, padding:'7px 18px', marginBottom:20,
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff', flexShrink:0 }} />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:'#fff' }}>COPAF 2026 · Maroc</span>
          </div>

          <h1 style={{ fontSize:'clamp(26px,7vw,58px)', fontWeight:900, color:'#fff', marginBottom:14, lineHeight:1.08, letterSpacing:'-0.03em' }}>
            Sponsors &{' '}
            <span style={{ color:'rgba(255,255,255,.7)' }}>Partenaires</span>
          </h1>
          <p style={{ fontSize:'clamp(13px,3vw,17px)', color:'rgba(255,255,255,.8)', maxWidth:540, margin:'0 auto 28px', lineHeight:1.8 }}>
            Associez votre organisation à la première conférence africaine sur les ports et la logistique maritime.
          </p>

          {/* Stats pills */}
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {['500+ Participants', '25+ Pays', '3 Jours', 'Maroc 2026'].map((s, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
                borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:600, color:'#fff',
              }}>{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CORPS ── */}
      <div style={{ padding: isMobile ? '36px 16px 60px' : 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', maxWidth:1200, margin:'0 auto' }}>

        {/* ── TABS ── */}
        <div style={{ maxWidth:520, margin:'0 auto 48px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#94a3b8', marginBottom:14 }}>
            Choisissez votre type de partenariat
          </p>
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:6,
            background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:16, padding:6,
            boxShadow:'0 2px 12px rgba(0,14,145,.06)',
          }}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className="tab-btn"
                onClick={() => handleSectionChange(s.id)}
                style={{
                  background: activeSection === s.id ? 'linear-gradient(135deg,#000E91,#0073F4)' : 'transparent',
                  borderRadius:10, padding: isMobile ? '12px 8px' : '16px 12px',
                  color: activeSection === s.id ? '#fff' : '#475569',
                }}
              >
                <div style={{ fontSize: isMobile ? 22 : 26, marginBottom:4 }}>{s.emoji}</div>
                <div style={{ fontSize: isMobile ? 12 : 13, fontWeight:800, lineHeight:1.3 }}>{s.label}</div>
                <div style={{ fontSize:10, color: activeSection === s.id ? 'rgba(255,255,255,.7)' : '#94a3b8', marginTop:3 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════
            SECTION SPONSORS
        ════════════════════════════════════ */}
        {activeSection === 'sponsor' && (
          <div className="fade-up">
            <div style={{ textAlign:'center', marginBottom: isMobile ? 20 : 32 }}>
              <h2 style={{ fontSize:'clamp(20px,4vw,34px)', fontWeight:900, color:'#0f172a', marginBottom:8 }}>
                Choisissez votre{' '}
                <span style={{ background:'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  niveau de sponsoring
                </span>
              </h2>
              <p style={{ color:'#64748b', fontSize:14, maxWidth:480, margin:'0 auto' }}>
                {isMobile ? 'Touchez une carte pour sélectionner et voir les avantages.' : 'Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire.'}
              </p>
            </div>

            {/* Pills raccourcis desktop */}
            {!isMobile && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', marginBottom:24 }}>
                {SPONSORS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedOption(s.id)}
                    style={{
                      background: selectedOption === s.id ? s.light : '#fff',
                      border: `1.5px solid ${selectedOption === s.id ? s.color : '#e2e8f0'}`,
                      borderRadius:100, padding:'6px 16px', cursor:'pointer',
                      fontSize:12, fontWeight:700,
                      color: selectedOption === s.id ? s.color : '#64748b',
                      transition:'all .2s', fontFamily:'inherit',
                    }}
                  >
                    {s.emoji} {s.label} — {s.price}
                  </button>
                ))}
              </div>
            )}

            {/* Grille cartes */}
            <div className="options-grid-4" style={{ marginBottom:40 }}>
              {SPONSORS.map(item => (
                <OptionCard key={item.id} item={item} selected={selectedOption} onSelect={setSelectedOption} isMobile={isMobile} />
              ))}
            </div>

            {/* Formulaire */}
            <div style={{ maxWidth:640, margin:'0 auto' }}>
              <div style={{
                background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:24,
                padding: isMobile ? '24px 18px' : '44px',
                boxShadow:'0 8px 40px rgba(0,14,145,.08)',
              }}>
                {doneSponsor ? (
                  <SuccessBlock contact={formSponsor.contact} />
                ) : (
                  <>
                    <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight:900, color:'#0f172a', textAlign:'center', marginBottom:6 }}>
                      Formulaire de demande Sponsor
                    </h3>
                    <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', marginBottom:24, lineHeight:1.5 }}>
                      {selectedOption
                        ? <><span style={{ color:'#64748b' }}>Niveau : </span><strong style={{ color: selectedSponsor?.color }}>Sponsor {selectedSponsor?.label} — {selectedSponsor?.price}</strong></>
                        : <span style={{ color:'#ef4444' }}>⚠️ Sélectionnez un niveau ci-dessus</span>
                      }
                    </p>

                    <form onSubmit={handleSubmitSponsor} noValidate>
                      <div className="form-row-2">
                        <Field label="Organisation *">
                          <input name="organisation" required value={formSponsor.organisation}
                            onChange={e => setFormSponsor(f => ({ ...f, organisation:e.target.value }))}
                            placeholder="Votre organisation" style={inputStyle('org')} {...foc('org')} autoComplete="organization" />
                        </Field>
                        <Field label="Nom du contact *">
                          <input name="contact" required value={formSponsor.contact}
                            onChange={e => setFormSponsor(f => ({ ...f, contact:e.target.value }))}
                            placeholder="Prénom Nom" style={inputStyle('contact')} {...foc('contact')} autoComplete="name" />
                        </Field>
                      </div>
                      <div className="form-row-2">
                        <Field label="Email *">
                          <input type="email" required value={formSponsor.email}
                            onChange={e => setFormSponsor(f => ({ ...f, email:e.target.value }))}
                            placeholder="votre@email.com" style={inputStyle('email')} {...foc('email')} autoComplete="email" />
                        </Field>
                        <Field label="Téléphone">
                          <input type="tel" value={formSponsor.telephone}
                            onChange={e => setFormSponsor(f => ({ ...f, telephone:e.target.value }))}
                            placeholder="+212 6XX XXX XXX" style={inputStyle('tel')} {...foc('tel')} autoComplete="tel" />
                        </Field>
                      </div>
                      <Field label="Pays *">
                        <input required value={formSponsor.pays}
                          onChange={e => setFormSponsor(f => ({ ...f, pays:e.target.value }))}
                          placeholder="Votre pays" style={inputStyle('pays')} {...foc('pays')} autoComplete="country-name" />
                      </Field>
                      <Field label="Message / Attentes">
                        <textarea rows={4} value={formSponsor.message}
                          onChange={e => setFormSponsor(f => ({ ...f, message:e.target.value }))}
                          placeholder="Vos objectifs, attentes ou questions..."
                          style={{ ...inputStyle('msg'), resize:'vertical', minHeight:90 }} {...foc('msg')} />
                      </Field>

                      {errorSponsor && <ErrorBox msg={errorSponsor} />}

                      <button type="submit" className="submit-btn" disabled={loadingSponsor}
                        style={{ background:'linear-gradient(135deg,#b45309,#7c3aed)', boxShadow:'0 8px 24px rgba(124,58,237,.25)' }}>
                        {loadingSponsor ? <><div className="spinner"/>Envoi…</> : <>💎 Envoyer ma demande Sponsor</>}
                      </button>
                      <p style={{ textAlign:'center', fontSize:11.5, color:'#94a3b8', marginTop:12 }}>
                        Notre équipe vous répondra sous 48h ouvrées.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            SECTION PARTENAIRES STRATÉGIQUES
        ════════════════════════════════════ */}
        {activeSection === 'strategique' && (
          <div className="fade-up">
            <div style={{ textAlign:'center', marginBottom: isMobile ? 20 : 32 }}>
              <h2 style={{ fontSize:'clamp(20px,4vw,34px)', fontWeight:900, color:'#0f172a', marginBottom:8 }}>
                Choisissez votre{' '}
                <span style={{ background:'linear-gradient(135deg,#000E91,#0073F4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  niveau de partenariat
                </span>
              </h2>
              <p style={{ color:'#64748b', fontSize:14, maxWidth:480, margin:'0 auto' }}>
                {isMobile ? 'Touchez une carte pour sélectionner et voir les avantages.' : 'Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire.'}
              </p>
            </div>

            {!isMobile && (
              <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
                {PARTENAIRES.map(p => (
                  <button key={p.id} onClick={() => setSelectedOption(p.id)} style={{
                    background: selectedOption === p.id ? p.light : '#fff',
                    border: `1.5px solid ${selectedOption === p.id ? p.color : '#e2e8f0'}`,
                    borderRadius:100, padding:'6px 16px', cursor:'pointer',
                    fontSize:12, fontWeight:700, color: selectedOption === p.id ? p.color : '#64748b',
                    transition:'all .2s', fontFamily:'inherit',
                  }}>
                    {p.emoji} {p.short} — {p.price}
                  </button>
                ))}
              </div>
            )}

            <div className="options-grid-2" style={{ maxWidth:900, margin:'0 auto 40px' }}>
              {PARTENAIRES.map(item => (
                <OptionCard key={item.id} item={item} selected={selectedOption} onSelect={setSelectedOption} isMobile={isMobile} />
              ))}
            </div>

            {/* Formulaire partenaire */}
            <div style={{ maxWidth:640, margin:'0 auto' }}>
              <div style={{
                background:'#fff', border:'1.5px solid rgba(0,14,145,.12)', borderRadius:24,
                padding: isMobile ? '24px 18px' : '44px',
                boxShadow:'0 8px 40px rgba(0,14,145,.10)',
              }}>
                {doneStrat ? (
                  <SuccessBlock contact={formStrat.contact} />
                ) : (
                  <>
                    <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight:900, color:'#0f172a', textAlign:'center', marginBottom:6 }}>
                      Formulaire de demande Partenariat
                    </h3>
                    <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', marginBottom:24, lineHeight:1.5 }}>
                      {selectedOption
                        ? <><span style={{ color:'#64748b' }}>Niveau : </span><strong style={{ color: selectedPartenaire?.color }}>{selectedPartenaire?.label} — {selectedPartenaire?.price}</strong></>
                        : <span style={{ color:'#ef4444' }}>⚠️ Sélectionnez un niveau ci-dessus</span>
                      }
                    </p>

                    <form onSubmit={handleSubmitStrat} noValidate>
                      <div className="form-row-2">
                        <Field label="Organisation / Port *">
                          <input required value={formStrat.organisation}
                            onChange={e => setFormStrat(f => ({ ...f, organisation:e.target.value }))}
                            placeholder="Ex : Port de Lomé" style={inputStyle('sorg')} {...foc('sorg')} autoComplete="organization" />
                        </Field>
                        <Field label="Type d'institution *">
                          <select required value={formStrat.type_institution}
                            onChange={e => setFormStrat(f => ({ ...f, type_institution:e.target.value }))}
                            style={{ ...inputStyle('type'), cursor:'pointer', color: formStrat.type_institution ? '#0f172a' : '#94a3b8' }}
                            {...foc('type')}>
                            <option value="" disabled>Sélectionner…</option>
                            {TYPES_INSTITUTION.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Pays *">
                        <input required value={formStrat.pays}
                          onChange={e => setFormStrat(f => ({ ...f, pays:e.target.value }))}
                          placeholder="Votre pays" style={inputStyle('spays')} {...foc('spays')} autoComplete="country-name" />
                      </Field>
                      <div className="form-row-2">
                        <Field label="Nom du contact *">
                          <input required value={formStrat.contact}
                            onChange={e => setFormStrat(f => ({ ...f, contact:e.target.value }))}
                            placeholder="Prénom Nom" style={inputStyle('scontact')} {...foc('scontact')} autoComplete="name" />
                        </Field>
                        <Field label="Email *">
                          <input type="email" required value={formStrat.email}
                            onChange={e => setFormStrat(f => ({ ...f, email:e.target.value }))}
                            placeholder="votre@institution.org" style={inputStyle('semail')} {...foc('semail')} autoComplete="email" />
                        </Field>
                      </div>
                      <Field label="Téléphone">
                        <input type="tel" value={formStrat.telephone}
                          onChange={e => setFormStrat(f => ({ ...f, telephone:e.target.value }))}
                          placeholder="+212 6XX XXX XXX" style={inputStyle('stel')} {...foc('stel')} autoComplete="tel" />
                      </Field>
                      <Field label="Message / Attentes">
                        <textarea rows={4} value={formStrat.message}
                          onChange={e => setFormStrat(f => ({ ...f, message:e.target.value }))}
                          placeholder="Décrivez vos attentes, vos objectifs…"
                          style={{ ...inputStyle('smsg'), resize:'vertical', minHeight:90 }} {...foc('smsg')} />
                      </Field>

                      {errorStrat && <ErrorBox msg={errorStrat} />}

                      <button type="submit" className="submit-btn" disabled={loadingStrat}
                        style={{ background:'linear-gradient(135deg,#000E91,#0073F4)', boxShadow:'0 8px 24px rgba(0,14,145,.25)' }}>
                        {loadingStrat ? <><div className="spinner"/>Envoi…</> : <>🏛️ Envoyer ma demande Partenariat</>}
                      </button>
                      <p style={{ textAlign:'center', fontSize:11.5, color:'#94a3b8', marginTop:12 }}>
                        Notre équipe vous répondra sous 48h ouvrées.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BLOCS RÉUTILISABLES ─────────────────────────────────────────────────────

function SuccessBlock({ contact }) {
  return (
    <div style={{ textAlign:'center', padding:'24px 0' }}>
      <div style={{
        width:72, height:72, borderRadius:'50%',
        background:'linear-gradient(135deg,#000E91,#0073F4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        margin:'0 auto 20px',
        boxShadow:'0 12px 32px rgba(0,14,145,.3)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{ fontSize:'clamp(18px,4vw,24px)', fontWeight:900, color:'#0f172a', marginBottom:10 }}>
        Demande enregistrée !
      </h3>
      <p style={{ color:'#64748b', fontSize:14, lineHeight:1.8, marginBottom:24 }}>
        Merci <strong style={{ color:'#0f172a' }}>{contact}</strong>.<br/>
        Notre équipe vous contactera dans les <strong style={{ color:'#0073F4' }}>48h</strong> pour finaliser votre partenariat.
      </p>
      <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:14, padding:'16px 20px', textAlign:'left' }}>
        {[
          '📧 Email de confirmation envoyé',
          '📞 Appel de présentation planifié',
          '📄 Dossier de partenariat envoyé',
          '✍️ Contrat préparé selon votre choix',
        ].map((s, i, arr) => (
          <div key={i} style={{ padding:'8px 0', fontSize:13, color:'#0369a1', borderBottom: i < arr.length - 1 ? '1px solid #e0f2fe' : 'none' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background:'#fef2f2', border:'1.5px solid #fca5a5',
      borderRadius:12, padding:'12px 16px', marginBottom:16,
      fontSize:13, color:'#dc2626', lineHeight:1.5,
    }}>
      ⚠️ {msg}
    </div>
  )
}