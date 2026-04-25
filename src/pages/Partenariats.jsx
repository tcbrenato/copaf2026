import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── SHEET URL ────────────────────────────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz7r-LgcYhTnR7VjHzq0KsrRUAp5fNrzn6Y4wnPf9rzc1-bd2j8aMbT8guG3P2i-kbe/exec'

// ─── ICONES SVG ──────────────────────────────────────────────────────────────
const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    checkSmall: <svg style={s} viewBox="0 0 10 10" fill="none"><polyline points="1.5 5 3.5 7.5 8.5 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    checkCircle:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    diamond:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22V9"/><path d="M6 3l6 6 6-6"/></svg>,
    building:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M9 7h1"/><path d="M14 7h1"/><path d="M9 12h1"/><path d="M14 12h1"/></svg>,
    star:       <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starOut:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    award:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    shield:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    users:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    globe:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    mail:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    file:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    edit:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    send:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    arrow:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    alert:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    chevDown:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    trophy:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="21" x2="12" y2="17"/><path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4"/><path d="M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4"/><rect x="7" y="2" width="10" height="12" rx="2"/></svg>,
    handshake:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>,
  }
  return icons[name] || null
}

const SPONSORS = [
  {
    id: 'platine', label: 'Platine', icon: 'trophy',
    price: '20 000 EUR', montant: 20000,
    badge: 'Niveau superieur',
    color: '#000E91', light: 'rgba(0,14,145,0.06)', border: 'rgba(0,14,145,0.25)',
    avantages: [
      'Membre COPAF — acces conferences mondiales',
      'Logo officiel sur tous les supports',
      'Certificat de partenariat officiel',
      '4 tickets de participation inclus',
      'Branding sur tous les supports visuels',
      '1 page dans le magazine Recap COPAF',
      '2 publicites dans la newsletter COPAF',
      'Assistance en intelligence artificielle',
      'Expose de 15 minutes pendant la conference',
      'Distribution de prospectus sur site',
    ],
  },
  {
    id: 'or', label: 'Or', icon: 'star',
    price: '16 000 EUR', montant: 16000,
    badge: 'Tres populaire',
    color: '#0073F4', light: 'rgba(0,115,244,0.06)', border: 'rgba(0,115,244,0.25)',
    avantages: [
      'Membre COPAF — acces conferences mondiales',
      'Logo sur le site de la conference',
      'Certificat de partenariat',
      '3 tickets de participation inclus',
      'Branding sur les supports visuels',
      '1/2 page dans le magazine Recap COPAF',
      '1 publicite dans la newsletter COPAF',
      'Expose de 10 minutes pendant la conference',
      'Distribution de prospectus sur site',
    ],
  },
  {
    id: 'argent', label: 'Argent', icon: 'award',
    price: '10 000 EUR', montant: 10000,
    badge: null,
    color: '#000E91', light: 'rgba(0,14,145,0.04)', border: 'rgba(0,14,145,0.15)',
    avantages: [
      'Membre COPAF — acces conferences mondiales',
      'Logo sur le site de la conference',
      'Certificat de partenariat',
      '2 tickets de participation inclus',
      'Branding sur les supports visuels',
      '1/4 page dans le magazine Recap COPAF',
      'Logo cite dans la newsletter COPAF',
      'Expose de 5 minutes pendant la conference',
    ],
  },
  {
    id: 'bronze', label: 'Bronze', icon: 'shield',
    price: '8 000 EUR', montant: 8000,
    badge: null,
    color: '#0073F4', light: 'rgba(0,115,244,0.04)', border: 'rgba(0,115,244,0.15)',
    avantages: [
      'Membre COPAF — acces conferences mondiales',
      'Logo sur le site de la conference',
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
    id: 'pso', label: 'Partenaire Strategique Officiel', short: 'PSO', icon: 'building',
    price: '30 000 EUR', montant: 30000,
    badge: 'Niveau premium',
    color: '#000E91', light: 'rgba(0,14,145,0.06)', border: 'rgba(0,14,145,0.25)',
    desc: "Le niveau d'engagement le plus eleve. Vous co-portez l'evenement avec COPAF.",
    avantages: [
      "Membre officiel du comite d'organisation COPAF 2026",
      'Logo #1 premium sur tous les supports officiels',
      'Co-branding COPAF x Votre organisation',
      'Tribune officielle — prise de parole 20 minutes',
      '6 badges participants inclus',
      'Page dediee premium sur le site COPAF',
      'Contenus prioritaires sur les tablettes',
      'Certificat de Partenariat Strategique Officiel',
      'Acces complet aux donnees et resultats',
      'Partenariat reconductible pour editions futures',
    ],
  },
  {
    id: 'ps', label: 'Partenaire Strategique', short: 'PS', icon: 'handshake',
    price: '20 000 EUR', montant: 20000,
    badge: 'Partenariat associe',
    color: '#0073F4', light: 'rgba(0,115,244,0.06)', border: 'rgba(0,115,244,0.25)',
    desc: "S'associer officiellement a la COPAF 2026 avec une forte visibilite.",
    avantages: [
      'Logo sur tous les supports officiels',
      'Mention Partenaire Strategique partout',
      'Prise de parole officielle — 10 minutes',
      '3 badges participants inclus',
      'Fiche dediee sur le site COPAF',
      'Contenus sur les tablettes participants',
      'Certificat de Partenariat Strategique',
      'Acces aux actes officiels de la conference',
    ],
  },
]

const TYPES_INSTITUTION = [
  'Port / Autorite portuaire',
  'Ministere / Gouvernement',
  'Organisation regionale (AGPAOC, UA...)',
  'Organisme de financement',
  'Autre institution',
]

// ─── BDD ─────────────────────────────────────────────────────────────────────
async function upsertContact({ email, nom, telephone, organisation, pays, source }) {
  const { data, error } = await supabase.from('contacts').upsert({ email, nom, telephone, organisation, pays, source }, { onConflict: 'email' }).select('id').single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createSponsorship({ contactId, type, niveau, montant, typeInstitution, message }) {
  const { error } = await supabase.from('sponsorships').insert([{ contact_id: contactId, type, niveau, montant, type_institution: typeInstitution || null, statut: 'nouveau', message }])
  if (error) throw new Error(error.message)
}

// ─── HOOK RESPONSIVE ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

// ─── CHECK ITEM ───────────────────────────────────────────────────────────────
const CheckItem = ({ text, color }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
      <Ico name="checkSmall" size={10} color={color} />
    </div>
    <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>{text}</span>
  </div>
)

// ─── OPTION CARD ─────────────────────────────────────────────────────────────
function OptionCard({ item, selected, onSelect, isMobile }) {
  const [open, setOpen] = useState(false)
  const isSelected = selected === item.id

  return (
    <div
      onClick={() => { onSelect(item.id); if (isMobile) setOpen(o => !o) }}
      style={{ background: isSelected ? item.light : '#fff', border: `2px solid ${isSelected ? item.color : '#e2e8f0'}`, borderRadius: 18, padding: isMobile ? '16px 14px' : '24px', cursor: 'pointer', transition: 'all .25s cubic-bezier(.34,1.56,.64,1)', transform: isSelected && !isMobile ? 'translateY(-4px)' : 'none', boxShadow: isSelected ? `0 12px 36px ${item.color}20` : '0 1px 4px rgba(0,0,0,.05)', position: 'relative', WebkitTapHighlightColor: 'transparent' }}
      onMouseEnter={e => { if (!isMobile && !isSelected) e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}18` }}
      onMouseLeave={e => { if (!isMobile && !isSelected) e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.color, borderRadius: '16px 16px 0 0', opacity: isSelected ? 1 : 0.3 }} />
      {isSelected && !isMobile && (
        <div style={{ position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico name="check" size={12} color="#fff" />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.color + '15', border: `1.5px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ico name={item.icon} size={18} color={item.color} />
            </div>
            {item.badge && (
              <div style={{ display: 'inline-block', background: item.color + '12', border: `1px solid ${item.color}25`, borderRadius: 100, padding: '2px 10px', fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: .5 }}>
                {item.badge}
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: item.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{item.short || item.label}</div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{item.price}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>participation unique</div>
        </div>
        {isMobile && (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isSelected ? item.color : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <Ico name="chevDown" size={16} color={isSelected ? '#fff' : '#64748b'} />
          </div>
        )}
      </div>
      {(!isMobile || open) && (
        <div style={{ marginTop: 16 }}>
          {item.desc && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.65 }}>{item.desc}</p>}
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 14 }} />
          {item.avantages.map((a, i) => <CheckItem key={i} text={a} color={item.color} />)}
        </div>
      )}
    </div>
  )
}

// ─── FIELD ───────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function Partenariats() {
  const location = useLocation()
  const isMobile = useIsMobile()

  const getInitialSection = () => new URLSearchParams(location.search).get('type') === 'strategique' ? 'strategique' : 'sponsor'

  const [activeSection,  setActiveSection]  = useState(getInitialSection)
  const [selectedOption, setSelectedOption] = useState(null)
  const [focused,        setFocused]        = useState('')

  const [formSponsor,    setFormSponsor]    = useState({ organisation: '', contact: '', email: '', telephone: '', pays: '', message: '' })
  const [loadingSponsor, setLoadingSponsor] = useState(false)
  const [doneSponsor,    setDoneSponsor]    = useState(false)
  const [errorSponsor,   setErrorSponsor]   = useState('')

  const [formStrat,      setFormStrat]      = useState({ organisation: '', type_institution: '', pays: '', contact: '', email: '', telephone: '', message: '' })
  const [loadingStrat,   setLoadingStrat]   = useState(false)
  const [doneStrat,      setDoneStrat]      = useState(false)
  const [errorStrat,     setErrorStrat]     = useState('')

  useEffect(() => {
    const t = new URLSearchParams(location.search).get('type')
    if (t === 'strategique' || t === 'sponsor') { setActiveSection(t); setSelectedOption(null) }
  }, [location.search])

  const handleSectionChange = id => {
    setActiveSection(id); setSelectedOption(null)
    setErrorSponsor(''); setErrorStrat('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inp = name => ({
    width: '100%', padding: '13px 16px', fontSize: isMobile ? 16 : 14, fontFamily: 'inherit', color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 12, outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance: 'none', appearance: 'none',
  })
  const foc = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })

  const handleSubmitSponsor = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorSponsor('Veuillez selectionner un niveau de sponsoring.'); return }
    setLoadingSponsor(true); setErrorSponsor('')
    try {
      const plan = SPONSORS.find(s => s.id === selectedOption)
      const contactId = await upsertContact({ email: formSponsor.email, nom: formSponsor.contact, telephone: formSponsor.telephone, organisation: formSponsor.organisation, pays: formSponsor.pays, source: 'sponsor' })
      await createSponsorship({ contactId, type: 'sponsor', niveau: selectedOption, montant: plan?.montant || null, message: formSponsor.message })

      // ─── Envoi Google Sheets ───────────────────────────────────────────────
      fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:         'sponsor',
          prenom:       formSponsor.contact,
          nom:          '',
          email:        formSponsor.email,
          telephone:    formSponsor.telephone,
          organisation: formSponsor.organisation,
          poste:        '',
          pays:         formSponsor.pays,
          participants: 1,
          montant:      plan?.price || selectedOption,
          dossier:      'SPONSOR-' + Date.now(),
          paiement:     selectedOption
        })
      }).catch(() => {})

      setDoneSponsor(true)
    } catch (err) { setErrorSponsor('Erreur : ' + err.message) }
    setLoadingSponsor(false)
  }

  const handleSubmitStrat = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorStrat('Veuillez selectionner un niveau de partenariat.'); return }
    setLoadingStrat(true); setErrorStrat('')
    try {
      const plan = PARTENAIRES.find(p => p.id === selectedOption)
      const contactId = await upsertContact({ email: formStrat.email, nom: formStrat.contact, telephone: formStrat.telephone, organisation: formStrat.organisation, pays: formStrat.pays, source: 'partenaire' })
      await createSponsorship({ contactId, type: 'partenaire_strategique', niveau: selectedOption, montant: plan?.montant || null, typeInstitution: formStrat.type_institution, message: formStrat.message })

      // ─── Envoi Google Sheets ───────────────────────────────────────────────
      fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:         'partenaire_strategique',
          prenom:       formStrat.contact,
          nom:          '',
          email:        formStrat.email,
          telephone:    formStrat.telephone,
          organisation: formStrat.organisation,
          poste:        formStrat.type_institution,
          pays:         formStrat.pays,
          participants: 1,
          montant:      plan?.price || selectedOption,
          dossier:      'PART-' + Date.now(),
          paiement:     selectedOption
        })
      }).catch(() => {})

      setDoneStrat(true)
    } catch (err) { setErrorStrat('Erreur : ' + err.message) }
    setLoadingStrat(false)
  }

  const selectedSponsor    = SPONSORS.find(s => s.id === selectedOption)
  const selectedPartenaire = PARTENAIRES.find(p => p.id === selectedOption)

  const SECTIONS = [
    { id: 'sponsor',     icon: 'diamond',   label: 'Sponsors',                  desc: 'Tarifs fixes, offres standardisees' },
    { id: 'strategique', icon: 'building',  label: 'Partenaires Strategiques',  desc: 'Ports & institutions publiques' },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans','Helvetica Neue',sans-serif", color: '#0f172a', backgroundImage: 'url(/bg2.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', position: 'relative' }}>

      <div style={{ position: 'fixed', inset: 0, background: 'rgba(248,250,255,0.93)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes spin   { to   { transform:rotate(360deg); } }
          .fade-up { animation: fadeUp .5s ease both; }
          .spinner { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
          .options-grid-4 { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px; }
          .options-grid-2 { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; }
          @media(max-width:1000px){ .options-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); } }
          @media(max-width:640px) { .options-grid-4,.options-grid-2 { grid-template-columns:minmax(0,1fr);gap:10px; } }
          .form-row-2 { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px; }
          @media(max-width:540px){ .form-row-2 { grid-template-columns:minmax(0,1fr); } }
          .tab-btn { border:none;cursor:pointer;font-family:inherit;transition:all .25s;-webkit-tap-highlight-color:transparent; }
          .submit-btn { width:100%;padding:15px;border:none;border-radius:14px;color:#fff;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer;transition:all .2s;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:10px; }
          .submit-btn:hover:not(:disabled){ opacity:.9;transform:translateY(-1px); }
          .submit-btn:active:not(:disabled){ transform:translateY(0); }
          .submit-btn:disabled { opacity:.5;cursor:not-allowed; }
          .pill-btn { border:none;cursor:pointer;font-family:inherit;transition:all .2s;display:flex;align-items:center;gap:6px; }
          @media(max-width:768px){ input,select,textarea { font-size:16px !important; } }
        `}</style>

        <div style={{ backgroundImage: 'url(/bg2.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative', overflow: 'hidden', padding: isMobile ? '80px 20px 52px' : 'clamp(100px,14vw,160px) clamp(24px,5vw,64px) clamp(64px,8vw,110px)', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,14,145,0.88)' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,115,244,.15)', pointerEvents: 'none' }} />

          <div className="fade-up" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 100, padding: '7px 18px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0073F4', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#fff' }}>COPAF 2026 &middot; Maroc</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px,7vw,58px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.08, letterSpacing: '-0.03em' }}>
              Sponsors &amp;{' '}
              <span style={{ color: 'rgba(255,255,255,.65)' }}>Partenaires</span>
            </h1>
            <p style={{ fontSize: 'clamp(13px,3vw,17px)', color: 'rgba(255,255,255,.8)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.8 }}>
              Associez votre organisation a la premiere conference africaine sur les ports et la logistique maritime.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['500+ Participants', '25+ Pays', '3 Jours', 'Maroc 2026'].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#fff' }}>{s}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: isMobile ? '36px 16px 60px' : 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ maxWidth: 520, margin: '0 auto 48px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 14 }}>
              Choisissez votre type de partenariat
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 6, boxShadow: '0 2px 12px rgba(0,14,145,.06)' }}>
              {SECTIONS.map(s => (
                <button key={s.id} className="tab-btn" onClick={() => handleSectionChange(s.id)} style={{ background: activeSection === s.id ? 'linear-gradient(135deg,#000E91,#0073F4)' : 'transparent', borderRadius: 10, padding: isMobile ? '12px 8px' : '16px 12px', color: activeSection === s.id ? '#fff' : '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <Ico name={s.icon} size={22} color={activeSection === s.id ? '#fff' : '#000E91'} />
                  </div>
                  <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 800, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: activeSection === s.id ? 'rgba(255,255,255,.7)' : '#94a3b8', marginTop: 3 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {activeSection === 'sponsor' && (
            <div className="fade-up">
              <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 32 }}>
                <h2 style={{ fontSize: 'clamp(20px,4vw,34px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
                  Choisissez votre{' '}
                  <span style={{ background: 'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>niveau de sponsoring</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
                  {isMobile ? 'Touchez une carte pour selectionner et voir les avantages.' : 'Cliquez sur un niveau pour le selectionner, puis remplissez le formulaire.'}
                </p>
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {SPONSORS.map(s => (
                    <button key={s.id} className="pill-btn" onClick={() => setSelectedOption(s.id)} style={{ background: selectedOption === s.id ? s.light : '#fff', border: `1.5px solid ${selectedOption === s.id ? s.color : '#e2e8f0'}`, borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: selectedOption === s.id ? s.color : '#64748b' }}>
                      <Ico name={s.icon} size={13} color={selectedOption === s.id ? s.color : '#94a3b8'} />
                      {s.label} — {s.price}
                    </button>
                  ))}
                </div>
              )}
              <div className="options-grid-4" style={{ marginBottom: 40 }}>
                {SPONSORS.map(item => <OptionCard key={item.id} item={item} selected={selectedOption} onSelect={setSelectedOption} isMobile={isMobile} />)}
              </div>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 24, padding: isMobile ? '24px 18px' : '44px', boxShadow: '0 8px 40px rgba(0,14,145,.08)' }}>
                  {doneSponsor ? <SuccessBlock contact={formSponsor.contact} /> : (
                    <>
                      <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 6 }}>Formulaire de demande Sponsor</h3>
                      <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
                        {selectedOption
                          ? <><span style={{ color: '#64748b' }}>Niveau : </span><strong style={{ color: selectedSponsor?.color }}>Sponsor {selectedSponsor?.label} — {selectedSponsor?.price}</strong></>
                          : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Ico name="alert" size={14} color="#ef4444" />Selectionnez un niveau ci-dessus</span>
                        }
                      </p>
                      <form onSubmit={handleSubmitSponsor} noValidate>
                        <div className="form-row-2">
                          <Field label="Organisation *"><input name="organisation" required value={formSponsor.organisation} onChange={e => setFormSponsor(f => ({ ...f, organisation: e.target.value }))} placeholder="Votre organisation" style={inp('org')} {...foc('org')} autoComplete="organization" /></Field>
                          <Field label="Nom du contact *"><input name="contact" required value={formSponsor.contact} onChange={e => setFormSponsor(f => ({ ...f, contact: e.target.value }))} placeholder="Prenom Nom" style={inp('contact')} {...foc('contact')} autoComplete="name" /></Field>
                        </div>
                        <div className="form-row-2">
                          <Field label="Email *"><input type="email" required value={formSponsor.email} onChange={e => setFormSponsor(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" style={inp('email')} {...foc('email')} autoComplete="email" /></Field>
                          <Field label="Telephone"><input type="tel" value={formSponsor.telephone} onChange={e => setFormSponsor(f => ({ ...f, telephone: e.target.value }))} placeholder="+212 6XX XXX XXX" style={inp('tel')} {...foc('tel')} autoComplete="tel" /></Field>
                        </div>
                        <Field label="Pays *"><input required value={formSponsor.pays} onChange={e => setFormSponsor(f => ({ ...f, pays: e.target.value }))} placeholder="Votre pays" style={inp('pays')} {...foc('pays')} autoComplete="country-name" /></Field>
                        <Field label="Message / Attentes"><textarea rows={4} value={formSponsor.message} onChange={e => setFormSponsor(f => ({ ...f, message: e.target.value }))} placeholder="Vos objectifs, attentes ou questions..." style={{ ...inp('msg'), resize: 'vertical', minHeight: 90 }} {...foc('msg')} /></Field>
                        {errorSponsor && <ErrorBox msg={errorSponsor} />}
                        <button type="submit" className="submit-btn" disabled={loadingSponsor} style={{ background: 'linear-gradient(135deg,#000E91,#0073F4)', boxShadow: '0 8px 24px rgba(0,14,145,.25)' }}>
                          {loadingSponsor ? <><div className="spinner" />Envoi...</> : <><Ico name="send" size={16} color="#fff" />Envoyer ma demande Sponsor</>}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 12 }}>Notre equipe vous repondra sous 48h ouvrées.</p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'strategique' && (
            <div className="fade-up">
              <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 32 }}>
                <h2 style={{ fontSize: 'clamp(20px,4vw,34px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
                  Choisissez votre{' '}
                  <span style={{ background: 'linear-gradient(135deg,#000E91,#0073F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>niveau de partenariat</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
                  {isMobile ? 'Touchez une carte pour selectionner et voir les avantages.' : 'Cliquez sur un niveau pour le selectionner, puis remplissez le formulaire.'}
                </p>
              </div>
              {!isMobile && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                  {PARTENAIRES.map(p => (
                    <button key={p.id} className="pill-btn" onClick={() => setSelectedOption(p.id)} style={{ background: selectedOption === p.id ? p.light : '#fff', border: `1.5px solid ${selectedOption === p.id ? p.color : '#e2e8f0'}`, borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: selectedOption === p.id ? p.color : '#64748b' }}>
                      <Ico name={p.icon} size={13} color={selectedOption === p.id ? p.color : '#94a3b8'} />
                      {p.short} — {p.price}
                    </button>
                  ))}
                </div>
              )}
              <div className="options-grid-2" style={{ maxWidth: 900, margin: '0 auto 40px' }}>
                {PARTENAIRES.map(item => <OptionCard key={item.id} item={item} selected={selectedOption} onSelect={setSelectedOption} isMobile={isMobile} />)}
              </div>
              <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ background: '#fff', border: '1.5px solid rgba(0,14,145,.12)', borderRadius: 24, padding: isMobile ? '24px 18px' : '44px', boxShadow: '0 8px 40px rgba(0,14,145,.10)' }}>
                  {doneStrat ? <SuccessBlock contact={formStrat.contact} /> : (
                    <>
                      <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 6 }}>Formulaire de demande Partenariat</h3>
                      <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}>
                        {selectedOption
                          ? <><span style={{ color: '#64748b' }}>Niveau : </span><strong style={{ color: selectedPartenaire?.color }}>{selectedPartenaire?.label} — {selectedPartenaire?.price}</strong></>
                          : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Ico name="alert" size={14} color="#ef4444" />Selectionnez un niveau ci-dessus</span>
                        }
                      </p>
                      <form onSubmit={handleSubmitStrat} noValidate>
                        <div className="form-row-2">
                          <Field label="Organisation / Port *"><input required value={formStrat.organisation} onChange={e => setFormStrat(f => ({ ...f, organisation: e.target.value }))} placeholder="Ex : Port de Lome" style={inp('sorg')} {...foc('sorg')} autoComplete="organization" /></Field>
                          <Field label="Type d'institution *">
                            <select required value={formStrat.type_institution} onChange={e => setFormStrat(f => ({ ...f, type_institution: e.target.value }))} style={{ ...inp('type'), cursor: 'pointer', color: formStrat.type_institution ? '#0f172a' : '#94a3b8' }} {...foc('type')}>
                              <option value="" disabled>Selectionner...</option>
                              {TYPES_INSTITUTION.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </Field>
                        </div>
                        <Field label="Pays *"><input required value={formStrat.pays} onChange={e => setFormStrat(f => ({ ...f, pays: e.target.value }))} placeholder="Votre pays" style={inp('spays')} {...foc('spays')} autoComplete="country-name" /></Field>
                        <div className="form-row-2">
                          <Field label="Nom du contact *"><input required value={formStrat.contact} onChange={e => setFormStrat(f => ({ ...f, contact: e.target.value }))} placeholder="Prenom Nom" style={inp('scontact')} {...foc('scontact')} autoComplete="name" /></Field>
                          <Field label="Email *"><input type="email" required value={formStrat.email} onChange={e => setFormStrat(f => ({ ...f, email: e.target.value }))} placeholder="votre@institution.org" style={inp('semail')} {...foc('semail')} autoComplete="email" /></Field>
                        </div>
                        <Field label="Telephone"><input type="tel" value={formStrat.telephone} onChange={e => setFormStrat(f => ({ ...f, telephone: e.target.value }))} placeholder="+212 6XX XXX XXX" style={inp('stel')} {...foc('stel')} autoComplete="tel" /></Field>
                        <Field label="Message / Attentes"><textarea rows={4} value={formStrat.message} onChange={e => setFormStrat(f => ({ ...f, message: e.target.value }))} placeholder="Decrivez vos attentes, vos objectifs..." style={{ ...inp('smsg'), resize: 'vertical', minHeight: 90 }} {...foc('smsg')} /></Field>
                        {errorStrat && <ErrorBox msg={errorStrat} />}
                        <button type="submit" className="submit-btn" disabled={loadingStrat} style={{ background: 'linear-gradient(135deg,#000E91,#0073F4)', boxShadow: '0 8px 24px rgba(0,14,145,.25)' }}>
                          {loadingStrat ? <><div className="spinner" />Envoi...</> : <><Ico name="send" size={16} color="#fff" />Envoyer ma demande Partenariat</>}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 12 }}>Notre equipe vous repondra sous 48h ouvrées.</p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── BLOCS REUTILISABLES ──────────────────────────────────────────────────────
function SuccessBlock({ contact }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#000E91,#0073F4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(0,14,145,.3)' }}>
        <Ico name="check" size={32} color="#fff" />
      </div>
      <h3 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Demande enregistree !</h3>
      <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
        Merci <strong style={{ color: '#0f172a' }}>{contact}</strong>.<br/>
        Notre equipe vous contactera dans les <strong style={{ color: '#0073F4' }}>48h</strong> pour finaliser votre partenariat.
      </p>
      <div style={{ background: 'rgba(0,115,244,0.05)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
        {[
          { icon: 'mail',  text: 'Email de confirmation envoye' },
          { icon: 'phone', text: 'Appel de presentation planifie' },
          { icon: 'file',  text: 'Dossier de partenariat envoye' },
          { icon: 'edit',  text: 'Contrat prepare selon votre choix' },
        ].map((s, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13, color: '#0073F4', borderBottom: i < arr.length - 1 ? '1px solid rgba(0,115,244,0.1)' : 'none' }}>
            <Ico name={s.icon} size={15} color="#0073F4" />
            {s.text}
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Ico name="alert" size={15} color="#dc2626" />
      {msg}
    </div>
  )
}