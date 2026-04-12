import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── ICONES SVG ──────────────────────────────────────────────────────────────
const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    leaf:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    calendar:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    barChart:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    target:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    zap:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    globe:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    tablet:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    mic:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    archive:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    check:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    checkCircle:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    star:       <svg style={s} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    plus:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    minus:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    close:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrow:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowRight: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    mail:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    send:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    users:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    map:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    clock:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    shield:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    trending:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    wifi:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 16 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    monitor:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
  }
  return icons[name] || null
}

// ─── DONNÉES ─────────────────────────────────────────────────────────────────
const STATS = [
  { num: '500+', label: 'Decideurs presents',  icon: 'users'    },
  { num: '32',   label: 'Pays representes',    icon: 'map'      },
  { num: '12',   label: 'Mois de visibilite',  icon: 'calendar' },
  { num: '0 EUR',label: 'Frais de transport',  icon: 'zap'      },
]

const AVANTAGES = [
  { icon: 'leaf',     title: 'Impact Carbone Zero',   desc: 'Aucun transport de materiel physique. Empreinte ecologique nulle.' },
  { icon: 'calendar', title: 'Visibilite 365 jours',  desc: 'Votre stand reste en ligne un an apres la conference.' },
  { icon: 'barChart', title: 'Data Precise',           desc: 'Rapport detaille des vues, clics et contacts inclus.' },
  { icon: 'target',   title: 'Lead Gen Direct',        desc: 'Les decideurs vous contactent en un clic depuis la vitrine.' },
  { icon: 'zap',      title: 'Zero Logistique',        desc: 'Concentrez-vous sur vos pitchs, nous gerons le reste.' },
]

const COMPARAISON = [
  { critere: 'Cout transport & montage',  classique: '5 000 EUR – 20 000 EUR', digital: '0 EUR' },
  { critere: 'Frais de douane',           classique: 'Imprevisibles',          digital: 'Aucun' },
  { critere: 'Duree de visibilite',       classique: '2 – 3 jours',            digital: '12 mois' },
  { critere: 'Mesure de performance',     classique: 'Impossible',             digital: 'Rapport PDF inclus' },
  { critere: 'Acces aux decideurs',       classique: 'Sur place uniquement',   digital: 'Sur place + a distance' },
  { critere: 'Accessible aux PME',        classique: 'Budget prohibitif',      digital: 'Des 500 EUR' },
  { critere: 'Bilan carbone',             classique: 'Impact lourd',           digital: 'Impact zero' },
]

const PILIERS = [
  {
    id: '01', color: '#0073F4', icon: 'globe',
    title: 'Vitrine Web Exclusive',
    short: 'Votre hub digital permanent sur le portail COPAF.',
    full: "Des votre inscription, nous creons une page dediee hautement optimisee pour le SEO. Elle inclut votre presentation strategique, vos liens officiels et un formulaire de captation de leads direct.",
    features: ['Indexation Google garantie', 'Formulaire de contact direct', 'Statistiques en temps reel'],
  },
  {
    id: '02', color: '#000E91', icon: 'tablet',
    title: 'Immersion Tablettes',
    short: 'Vos solutions prechargees sur les outils des decideurs.',
    full: "A Tanger Med, chaque delegue recoit une tablette tactile haut de gamme. Vos brochures et videos y sont integrees nativement pour une consultation fluide, meme sans connexion internet.",
    features: ['Acces 100% Offline', 'Lecture video fluide', 'Experience tactile premium'],
  },
  {
    id: '03', color: '#0073F4', icon: 'mic',
    title: 'Session Pitch & Demo',
    short: 'Une prise de parole magistrale en auditorium.',
    full: "Beneficiez d'un creneau strategique dans le programme officiel pour presenter vos innovations devant l'ensemble des delegations et autorites portuaires presentes.",
    features: ['Auditorium de 500+ decideurs', 'Captation video HD offerte', 'QR Code interactif sur ecran'],
  },
  {
    id: '04', color: '#000E91', icon: 'archive',
    title: 'Heritage Post-Event',
    short: 'Une visibilite qui dure 12 mois apres Tanger Med.',
    full: "L'exposition ne s'arrete pas a la cloture. Votre vitrine reste active pendant un an sur le site COPAF, servant de reference pour les futurs appels d'offres du secteur.",
    features: ['Referencement annuel', 'Inclusion dans les Actes officiels', 'Reseautage continu'],
  },
]

const WORKFLOW = [
  { num: '1', title: 'Inscription',     desc: 'Choix de formule et paiement securise.' },
  { num: '2', title: 'Upload',          desc: 'Depot de logos, PDF et videos via votre espace prive.' },
  { num: '3', title: 'Validation',      desc: 'Notre equipe publie votre vitrine et genere votre Smart Badge.' },
  { num: '4', title: 'Live Tanger Med', desc: 'Pitch en auditorium + demos sur tablettes lors des pauses reseau.' },
  { num: '5', title: 'Rapport PDF',     desc: 'Vues, contacts generes et telechargements detailles post-event.' },
]

const PLANS = [
  {
    id: 'ESSENTIELLE', color: '#475569', featured: false, price: '500', tag: 'Ideal PME',
    features: ['Fiche portail officiel', 'Logo + Description', 'QR Code numerique', '1 Brochure PDF', 'Rapport de performance'],
  },
  {
    id: 'AVANCEE', color: '#0073F4', featured: true, price: '1 500', tag: 'Le plus choisi',
    features: ['Tout Pack Essentielle', '3 Brochures PDF', 'Video de presentation HD', '1 Badge VIP inclus', 'Session Pitch 10 min', 'Rapport analytique complet'],
  },
  {
    id: 'PREMIUM', color: '#000E91', featured: false, price: '3 000', tag: 'Impact maximum',
    features: ['Tout Pack Avancee', 'Brochures illimitees', 'Pitch 15 min + Q&A', '2 Badges VIP inclus', 'Demonstration Live', 'Captation video HD', 'Matching decideurs prioritaire'],
  },
]

const TEMOIGNAGES = [
  { text: "Le rapport post-evenement nous a montre que notre video avait ete consultee par 3 directeurs de ports que nous n'aurions jamais rencontres physiquement. Un ROI impossible a obtenir avec un stand classique.", name: 'Mehdi Ouarrach', role: 'CEO, PortLogix Solutions', initials: 'MO', color: '#0073F4' },
  { text: "Pour une PME comme nous, exposer a Tanger Med etait un reve inaccessible. Avec la formule Essentielle, nous avons eu la meme visibilite numerique que des groupes dix fois plus grands.", name: 'Aminata Diallo', role: 'Directrice, WestPort Tech', initials: 'AD', color: '#000E91' },
  { text: "Le mode offline sur tablette a ete decisif. Le Wi-Fi saturait dans les couloirs, mais nos brochures fonctionnaient parfaitement. Nos concurrents etaient bloques.", name: 'Carlos Ferreira', role: 'VP Commercial, NavTech Iberica', initials: 'CF', color: '#475569' },
]

const FAQS = [
  { q: "Qui gere les tablettes sur place ?", a: "COPAF prend en charge l'integralite de la logistique : acquisition, prechargement, distribution aux delegues VIP et collecte en fin d'evenement." },
  { q: "Comment fonctionne le mode offline ?", a: "Grace a la technologie Service Worker, tous vos fichiers sont telecharges avant l'evenement. Les delegues y acce dent instantanement meme sans Wi-Fi." },
  { q: "Comment le rapport est-il produit ?", a: "Chaque delegue est authentifie via son badge QR. Chaque consultation, telechargement ou clic sur votre vitrine est trace nominalement." },
  { q: "Ma vitrine reste-t-elle 12 mois en ligne ?", a: "Oui, sans frais supplementaires. Votre page reste indexee sur le portail COPAF et accessible via Google pendant 12 mois." },
  { q: "Puis-je modifier mes contenus apres l'upload ?", a: "Oui, jusqu'a 7 jours avant l'evenement. Passe ce delai, les fichiers sont verrouilles pour le prechargement sur les tablettes." },
  { q: "Quelle est la date limite d'inscription ?", a: "30 jours avant la conference. Il est conseille de s'inscrire au moins 60 jours a l'avance pour une vitrine SEO optimisee." },
]

// ─── BDD ─────────────────────────────────────────────────────────────────────
async function upsertContact({ email, nom, telephone, organisation, secteur }) {
  const { data, error } = await supabase.from('contacts').upsert({ email, nom, telephone, organisation, poste: secteur, source: 'exposant' }, { onConflict: 'email' }).select('id').single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createExposant({ contactId, entreprise, secteur, forfait, goals }) {
  const { error } = await supabase.from('exposants').insert([{ contact_id: contactId, entreprise, secteur, forfait, statut: 'nouveau', goals }])
  if (error) throw new Error(error.message)
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── SECTION ─────────────────────────────────────────────────────────────────
function Section({ children, alt, id }) {
  const [ref, visible] = useScrollReveal()
  return (
    <section ref={ref} id={id} style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)', background: alt ? '#f8faff' : '#fff', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity .6s ease, transform .6s ease' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
      <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#0073F4', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 }}>{eyebrow}</div>
      <h2 style={{ fontSize: 'clamp(22px,4.5vw,40px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ color: '#64748b', fontSize: 'clamp(14px,2vw,16px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>{sub}</p>}
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function ExpositionDigitale() {
  const [activeModal,  setActiveModal]  = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [openFaq,      setOpenFaq]      = useState(null)
  const [focused,      setFocused]      = useState('')
  const [floatVisible, setFloatVisible] = useState(false)
  const [formData,     setFormData]     = useState({ company:'', sector:'', name:'', role:'', email:'', phone:'', goals:'' })
  const [formError,    setFormError]    = useState('')
  const [formSent,     setFormSent]     = useState(false)
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    const fn = () => setFloatVisible(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo   = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const handleField = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const inp = name => ({
    width: '100%', padding: '13px 16px', fontSize: 15, fontFamily: 'inherit', color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 12, outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance: 'none', appearance: 'none',
  })
  const foc = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 7 }

  const submitForm = async e => {
    e.preventDefault(); setFormError('')
    if (!formData.company || !formData.name || !formData.email || !selectedPlan) { setFormError('Veuillez remplir : entreprise, nom, email et formule.'); return }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { setFormError('Adresse email invalide.'); return }
    setLoading(true)
    try {
      const contactId = await upsertContact({ email: formData.email, nom: formData.name, telephone: formData.phone, organisation: formData.company, secteur: formData.sector })
      await createExposant({ contactId, entreprise: formData.company, secteur: formData.sector, forfait: selectedPlan, goals: formData.goals })
      setFormSent(true)
    } catch (err) { setFormError('Erreur : ' + err.message) }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0f172a', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { to   { transform:rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-up   { animation: fadeUp .5s ease both; }
        .fade-up-1 { animation: fadeUp .5s .05s ease both; }
        .fade-up-2 { animation: fadeUp .5s .15s ease both; }
        .fade-up-3 { animation: fadeUp .5s .25s ease both; }
        .spinner   { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }

        .float-cta { position:fixed;bottom:24px;right:20px;z-index:9999;background:#000E91;color:#fff;border:none;padding:14px 24px;border-radius:50px;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,14,145,.4);opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .3s,transform .3s;display:flex;align-items:center;gap:8px; }
        .float-cta.show { opacity:1;transform:translateY(0);pointer-events:auto; }
        .float-cta:hover { background:#0f1f8a; }

        .pilier-card { background:#fff;border:1.5px solid #e2e8f0;border-radius:20px;padding:clamp(20px,4vw,32px);cursor:pointer;transition:all .28s cubic-bezier(.34,1.56,.64,1); }
        .pilier-card:hover { transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,115,244,.13);border-color:#0073F4; }
        .pilier-card:active { transform:scale(.98); }
        @media(max-width:520px){.pilier-card:hover{transform:none}}

        .piliers-grid   { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; }
        .pricing-grid   { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px; }
        .temo-grid      { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px; }
        .avantages-grid { display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px; }
        @media(max-width:1000px){ .pricing-grid { grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); } }
        @media(max-width:900px) { .avantages-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media(max-width:700px) { .temo-grid { grid-template-columns:minmax(0,1fr); } }
        @media(max-width:640px) { .pricing-grid { grid-template-columns:minmax(0,1fr); } .cmp-table { display:none; } .cmp-mobile { display:flex !important; } }
        @media(max-width:540px) { .piliers-grid,.avantages-grid { grid-template-columns:minmax(0,1fr); } }

        .cmp-table { width:100%;border-collapse:collapse;font-size:14px; }
        .cmp-table th,.cmp-table td { padding:14px 18px; }
        .cmp-table thead th { font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:.5px; }
        .cmp-table tbody td { border-bottom:1px solid #f1f5f9; }
        .cmp-table tbody tr:last-child td { border-bottom:none; }
        .cmp-mobile { display:none;flex-direction:column;gap:10px; }

        .workflow { display:flex;gap:0;align-items:flex-start; }
        @media(max-width:640px){ .workflow { flex-direction:column; } }

        .form-row-2 { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:14px; }
        @media(max-width:520px){ .form-row-2 { grid-template-columns:minmax(0,1fr); } }

        .modal-overlay { position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease; }
        .modal-box { background:#fff;border-radius:24px 24px 0 0;width:100%;max-height:88vh;padding:36px 24px 48px;overflow-y:auto;position:relative;box-shadow:0 -8px 40px rgba(0,0,0,.15);animation:slideUp .3s ease; }
        @media(min-width:640px){ .modal-overlay { align-items:center;padding:24px; } .modal-box { border-radius:24px;max-width:520px;max-height:80vh;padding:44px; } }

        .faq-item { background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:10px; }
        .faq-q { padding:18px 20px;font-weight:700;font-size:14px;color:#0f172a;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;user-select:none;line-height:1.4;transition:background .15s; }
        .faq-q:hover { background:#f8fafc; }
        .faq-a { padding:14px 20px 18px;color:#64748b;font-size:14px;line-height:1.75;border-top:1px solid #f1f5f9; }

        .btn-primary { background:linear-gradient(135deg,#0073F4,#000E91);color:#fff;border:none;border-radius:14px;padding:16px 28px;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 8px 24px rgba(0,115,244,.3);transition:all .2s;display:flex;align-items:center;gap:8px; }
        .btn-primary:hover { opacity:.9;transform:translateY(-1px); }
        .btn-outline { background:transparent;color:#0f172a;border:2px solid #e2e8f0;border-radius:14px;padding:14px 24px;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s; }
        .btn-outline:hover { border-color:#0073F4;color:#0073F4; }
        .select-btn { width:100%;padding:14px;border:none;border-radius:12px;color:#fff;font-family:inherit;font-weight:800;font-size:14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px; }
        .select-btn:hover { opacity:.88;transform:translateY(-1px); }
        .submit-btn { width:100%;padding:16px;border:none;border-radius:14px;background:linear-gradient(135deg,#0073F4,#000E91);color:#fff;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(0,115,244,.3); }
        .submit-btn:hover:not(:disabled) { opacity:.9;transform:translateY(-1px); }
        .submit-btn:disabled { opacity:.5;cursor:not-allowed; }

        @media(max-width:768px){ input,select,textarea { font-size:16px !important; } }
      `}</style>

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── FLOAT CTA ── */}
      <button className={`float-cta ${floatVisible ? 'show' : ''}`} onClick={() => scrollTo('inscription')}>
        Reserver ma place
        <Ico name="arrowRight" size={16} color="#fff" />
      </button>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: 'clamp(100px,14vw,160px) clamp(16px,5vw,60px) clamp(60px,10vw,120px)',
        backgroundImage: 'url(/bg9.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        {/* Overlay propre */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(1px)' }} />

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="fade-up" style={{ display: 'inline-block', padding: '7px 18px', background: 'rgba(0,115,244,.1)', color: '#0073F4', borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
            TANGER MED &middot; MAROC &middot; 2026
          </div>

          <h1 className="fade-up-1" style={{ fontSize: 'clamp(30px,7vw,62px)', fontWeight: 900, color: '#000E91', marginBottom: 20, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            L'Exposition{' '}
            <span style={{ background: 'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              100% Digitale
            </span>
          </h1>

          <p className="fade-up-2" style={{ color: '#475569', fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.8, marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
            Votre technologie directement dans les mains des decideurs portuaires — sans stand, sans logistique, avec plus d'impact.
          </p>

          <div className="fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => scrollTo('inscription')}>
              Reserver ma place
              <Ico name="arrowRight" size={16} color="#fff" />
            </button>
            <button className="btn-outline" onClick={() => scrollTo('piliers')}>Comment ca marche ?</button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#000E91', padding: 'clamp(24px,4vw,40px) clamp(16px,5vw,60px)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name={s.icon} size={18} color="rgba(255,255,255,.8)" />
            </div>
            <div style={{ fontSize: 'clamp(22px,5vw,40px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── AVANTAGES ── */}
      <Section alt>
        <SectionHeader eyebrow="Pourquoi digital ?" title="5 raisons de choisir l'exposition digitale" />
        <div className="avantages-grid">
          {AVANTAGES.map((a, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: 'clamp(18px,3vw,28px)', textAlign: 'center', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,115,244,.1)'; e.currentTarget.style.borderColor = '#0073F4' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Ico name={a.icon} size={24} color="#0073F4" />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COMPARAISON ── */}
      <Section>
        <SectionHeader eyebrow="Stand classique vs Digital" title="Un tableau qui convainc en 30 secondes" />
        <div style={{ overflowX: 'auto', borderRadius: 18, border: '1.5px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <table className="cmp-table">
            <thead>
              <tr style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', color: '#64748b', padding: '16px 18px' }}>Critere</th>
                <th style={{ background: '#fef2f2', color: '#991b1b', textAlign: 'center', borderLeft: '1px solid #fecaca' }}>Stand Physique</th>
                <th style={{ background: '#eff6ff', color: '#1e40af', textAlign: 'center', borderLeft: '1px solid #bfdbfe' }}>COPAF Digital</th>
              </tr>
            </thead>
            <tbody>
              {COMPARAISON.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>{row.critere}</td>
                  <td style={{ color: '#b91c1c', textAlign: 'center', background: '#fffafa', borderLeft: '1px solid #fecaca', fontSize: 13 }}>{row.classique}</td>
                  <td style={{ color: '#1e40af', textAlign: 'center', fontWeight: 700, background: '#f0f7ff', borderLeft: '1px solid #bfdbfe', fontSize: 13 }}>{row.digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cmp-mobile">
          {COMPARAISON.map((row, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{row.critere}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '12px 14px', background: '#fffafa', borderRight: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#991b1b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Physique</div>
                  <div style={{ fontSize: 12, color: '#b91c1c' }}>{row.classique}</div>
                </div>
                <div style={{ padding: '12px 14px', background: '#f0f7ff', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#1e40af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Digital</div>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 700 }}>{row.digital}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4 PILIERS ── */}
      <Section alt id="piliers">
        <SectionHeader eyebrow="Le dispositif" title="4 piliers pour une presence maximale" sub="Cliquez sur chaque pilier pour decouvrir les details." />
        <div className="piliers-grid">
          {PILIERS.map(p => (
            <div key={p.id} className="pilier-card" onClick={() => setActiveModal(p)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: p.color + '15', border: `1.5px solid ${p.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ico name={p.icon} size={20} color={p.color} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: p.color, letterSpacing: 1 }}>PILIER {p.id}</div>
              </div>
              <h3 style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{p.short}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontSize: 13, fontWeight: 700 }}>
                En savoir plus
                <Ico name="arrowRight" size={14} color={p.color} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── WORKFLOW ── */}
      <Section>
        <SectionHeader eyebrow="Le parcours exposant" title="5 etapes, de l'inscription au rapport" />
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="workflow">
            {WORKFLOW.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 0, flex: 1, flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i < WORKFLOW.length - 1 && (
                  <div style={{ position: 'absolute', top: 22, left: '50%', width: '100%', height: 2, background: 'linear-gradient(90deg,#0073F4,#000E91)', zIndex: 0 }} />
                )}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: '0 4px 16px rgba(0,115,244,.3)' }}>
                  {w.num}
                </div>
                <div style={{ textAlign: 'center', padding: 'clamp(10px,2vw,16px) clamp(4px,1vw,12px) 0' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── TARIFS ── */}
      <Section alt id="tarifs">
        <SectionHeader eyebrow="Nos formules" title="Choisissez votre niveau d'impact" sub="De la PME au leader mondial, un pack adapte a chaque strategie." />
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: '#fff', border: `1.5px solid ${plan.featured ? plan.color : '#e2e8f0'}`, borderTop: `5px solid ${plan.color}`, borderRadius: 22, padding: 'clamp(24px,4vw,38px)', textAlign: 'center', position: 'relative', boxShadow: plan.featured ? `0 16px 48px ${plan.color}22` : '0 2px 8px rgba(0,0,0,.04)', transform: plan.featured ? 'scale(1.03)' : 'none', transition: 'all .25s' }}>
              {plan.featured && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 18px', borderRadius: 50, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Ico name="star" size={12} color="#fff" />
                  {plan.tag}
                </div>
              )}
              {!plan.featured && <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>{plan.tag}</div>}
              <div style={{ fontSize: 11, fontWeight: 900, color: plan.color, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>{plan.id}</div>
              <div style={{ fontSize: 'clamp(38px,8vw,54px)', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>
                {plan.price}<span style={{ fontSize: 20, verticalAlign: 'super' }}>€</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>paiement unique</div>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 28, padding: 0 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < plan.features.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: 13.5, color: '#334155' }}>
                    <Ico name="checkCircle" size={16} color="#22c55e" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="select-btn" style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}cc)`, boxShadow: `0 6px 20px ${plan.color}30` }} onClick={() => { setSelectedPlan(plan.id); scrollTo('inscription') }}>
                Choisir {plan.id}
                <Ico name="arrowRight" size={15} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TEMOIGNAGES ── */}
      <Section>
        <SectionHeader eyebrow="Ils nous font confiance" title="Ce que disent nos participants" />
        <div className="temo-grid">
          {TEMOIGNAGES.map((t, i) => (
            <div key={i} style={{ background: '#f8faff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 'clamp(20px,3vw,28px)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => <Ico key={j} name="star" size={14} color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section alt>
        <SectionHeader eyebrow="Questions frequentes" title="Tout ce que vous devez savoir" />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: openFaq === i ? '#0073F4' : '#f1f5f9', color: openFaq === i ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .25s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                  <Ico name="plus" size={16} color={openFaq === i ? '#fff' : '#64748b'} />
                </div>
              </div>
              {openFaq === i && <div className="faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </Section>

      {/* ── FORMULAIRE ── */}
      <section id="inscription" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)', backgroundImage: 'url(/bg9.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,14,145,0.88)' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px,5vw,52px)', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
            {formSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(0,14,145,.3)' }}>
                  <Ico name="check" size={32} color="#fff" />
                </div>
                <h3 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Demande recue !</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>Notre equipe COPAF vous contactera dans les <strong style={{ color: '#0073F4' }}>24 heures</strong> pour confirmer votre exposition.</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Reservez votre exposition</h2>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>Soumettez votre demande pour COPAF 2026. Notre equipe vous contacte sous 24h.</p>
                </div>

                <form onSubmit={submitForm} noValidate>
                  <div className="form-row-2">
                    <div><label style={lbl}>Entreprise *</label><input name="company" value={formData.company} onChange={handleField} required placeholder="Ex : Port Tech Solutions" style={inp('company')} {...foc('company')} autoComplete="organization" /></div>
                    <div><label style={lbl}>Secteur</label><input name="sector" value={formData.sector} onChange={handleField} placeholder="Ex : Logistique portuaire" style={inp('sector')} {...foc('sector')} /></div>
                  </div>
                  <div className="form-row-2">
                    <div><label style={lbl}>Nom & Prenom *</label><input name="name" value={formData.name} onChange={handleField} required placeholder="Prenom Nom" style={inp('name')} {...foc('name')} autoComplete="name" /></div>
                    <div><label style={lbl}>Poste</label><input name="role" value={formData.role} onChange={handleField} placeholder="Ex : Directeur General" style={inp('role')} {...foc('role')} /></div>
                  </div>
                  <div style={{ marginBottom: 14 }}><label style={lbl}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleField} required placeholder="contact@entreprise.com" style={inp('email')} {...foc('email')} autoComplete="email" /></div>
                  <div style={{ marginBottom: 14 }}><label style={lbl}>Telephone / WhatsApp</label><input type="tel" name="phone" value={formData.phone} onChange={handleField} placeholder="+212 600 000 000" style={inp('phone')} {...foc('phone')} autoComplete="tel" /></div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Formule souhaitee *</label>
                    <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} required style={{ ...inp('plan'), cursor: 'pointer', color: selectedPlan ? '#0f172a' : '#94a3b8' }} {...foc('plan')}>
                      <option value="">-- Selectionnez une formule --</option>
                      <option value="ESSENTIELLE">ESSENTIELLE — 500 EUR</option>
                      <option value="AVANCEE">AVANCEE — 1 500 EUR</option>
                      <option value="PREMIUM">PREMIUM — 3 000 EUR</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={lbl}>Vos objectifs pour COPAF 2026</label>
                    <textarea name="goals" value={formData.goals} onChange={handleField} rows={3} placeholder="Ex : Trouver des partenaires en Afrique de l'Ouest, presenter notre solution..." style={{ ...inp('goals'), resize: 'vertical', minHeight: 80 }} {...foc('goals')} />
                  </div>

                  {formError && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 18 }}>
                      {formError}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <><div className="spinner" />Envoi en cours...</> : <>Envoyer ma demande <Ico name="send" size={16} color="#fff" /></>}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 14, lineHeight: 1.6 }}>Notre equipe vous repondra sous 24h ouvrées.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0f2c', padding: 'clamp(20px,4vw,32px) clamp(16px,5vw,60px)', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.8 }}>
        &copy; 2026 COPAF &mdash; Tanger Med &middot; Exposition 100% Digitale &middot; Tous droits reserves
      </footer>

      {/* ── MODALE PILIER ── */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="close" size={14} color="#64748b" />
            </button>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 28px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: activeModal.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ico name={activeModal.icon} size={20} color={activeModal.color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: activeModal.color, letterSpacing: 2, textTransform: 'uppercase' }}>PILIER {activeModal.id}</div>
            </div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#0f172a', marginBottom: 14 }}>{activeModal.title}</h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>{activeModal.full}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {activeModal.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 50, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeModal.color, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}