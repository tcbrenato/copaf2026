import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

// ─── DONNÉES ─────────────────────────────────────────────────────────────────

const STATS = [
  { num: '500+', label: 'Décideurs présents' },
  { num: '32',   label: 'Pays représentés' },
  { num: '12',   label: 'Mois de visibilité' },
  { num: '0€',   label: 'Frais de transport' },
]

const AVANTAGES = [
  { icon: '🌿', title: 'Impact Carbone Zéro',    desc: 'Aucun transport de matériel physique.' },
  { icon: '📅', title: 'Visibilité 365 jours',   desc: 'Votre stand reste en ligne un an après la conférence.' },
  { icon: '📊', title: 'Data Précise',            desc: 'Rapport détaillé des vues et clics inclus.' },
  { icon: '🎯', title: 'Lead Gen Direct',         desc: 'Les décideurs vous contactent en un clic.' },
  { icon: '⚡', title: 'Zéro Logistique',         desc: 'Concentrez-vous sur vos pitchs.' },
]

const COMPARAISON = [
  { critere: 'Coût transport & montage',  classique: '5 000€ – 20 000€',      digital: '0 €' },
  { critere: 'Frais de douane',           classique: 'Imprévisibles',          digital: 'Aucun' },
  { critere: 'Durée de visibilité',       classique: '2 – 3 jours',            digital: '12 mois' },
  { critere: 'Mesure de performance',     classique: 'Impossible',             digital: 'Rapport PDF inclus' },
  { critere: 'Accès aux décideurs',       classique: 'Sur place uniquement',   digital: 'Sur place + à distance' },
  { critere: 'Accessible aux PME',        classique: 'Budget prohibitif',      digital: 'Dès 500 €' },
  { critere: 'Bilan carbone',             classique: 'Lourd',                  digital: 'Impact zéro' },
]

const PILIERS = [
  {
    id: '01', color: '#0073F4',
    title: 'Vitrine Web Exclusive',
    short: 'Votre hub digital permanent sur le portail COPAF.',
    full: "Dès votre inscription, nous créons une page dédiée hautement optimisée pour le SEO. Elle inclut votre présentation stratégique, vos liens officiels et un formulaire de captation de leads direct.",
    features: ['Indexation Google garantie', 'Formulaire de contact direct', 'Statistiques en temps réel'],
  },
  {
    id: '02', color: '#000E91',
    title: 'Immersion Tablettes',
    short: 'Vos solutions préchargées sur les outils des décideurs.',
    full: "À Tanger Med, chaque délégué reçoit une tablette tactile haut de gamme. Vos brochures et vidéos y sont intégrées nativement pour une consultation fluide, même sans connexion internet.",
    features: ['Accès 100% Offline', 'Lecture vidéo fluide', 'Expérience tactile premium'],
  },
  {
    id: '03', color: '#0073F4',
    title: 'Session Pitch & Démo',
    short: 'Une prise de parole magistrale en auditorium.',
    full: "Bénéficiez d'un créneau stratégique dans le programme officiel pour présenter vos innovations devant l'ensemble des délégations et autorités portuaires présentes.",
    features: ['Auditorium de 500+ décideurs', 'Captation vidéo HD offerte', 'QR Code interactif sur écran'],
  },
  {
    id: '04', color: '#000E91',
    title: 'Héritage Post-Event',
    short: 'Une visibilité qui dure 12 mois après Tanger Med.',
    full: "L'exposition ne s'arrête pas à la clôture. Votre vitrine reste active pendant un an sur le site COPAF, servant de référence pour les futurs appels d'offres du secteur.",
    features: ['Référencement annuel', 'Inclusion dans les Actes officiels', 'Réseautage continu'],
  },
]

const WORKFLOW = [
  { num: '1', title: 'Inscription',     desc: 'Choix de formule et paiement sécurisé.' },
  { num: '2', title: 'Upload',          desc: 'Dépôt de logos, PDF et vidéos via votre espace privé.' },
  { num: '3', title: 'Validation',      desc: 'Notre équipe publie votre vitrine et génère votre Smart Badge.' },
  { num: '4', title: 'Live Tanger Med', desc: 'Pitch en auditorium + démos sur tablettes lors des pauses réseau.' },
  { num: '5', title: 'Rapport PDF',     desc: 'Vues, contacts générés et téléchargements détaillés post-event.' },
]

const PLANS = [
  {
    id: 'ESSENTIELLE', color: '#475569', featured: false,
    price: '500', tag: 'Idéal PME',
    features: ['Fiche portail officiel', 'Logo + Description', 'QR Code numérique', '1 Brochure PDF', 'Rapport de performance'],
  },
  {
    id: 'AVANCÉE', color: '#0073F4', featured: true,
    price: '1 500', tag: 'Le plus choisi',
    features: ['Tout Pack Essentielle', '3 Brochures PDF', 'Vidéo de présentation HD', '1 Badge VIP inclus', 'Session Pitch 10 min', 'Rapport analytique complet'],
  },
  {
    id: 'PREMIUM', color: '#000E91', featured: false,
    price: '3 000', tag: 'Impact maximum',
    features: ['Tout Pack Avancée', 'Brochures illimitées', 'Pitch 15 min + Q&A', '2 Badges VIP inclus', 'Démonstration Live', 'Captation vidéo HD', 'Matching décideurs prioritaire'],
  },
]

const TEMOIGNAGES = [
  {
    text: "Le rapport post-événement nous a montré que notre vidéo avait été consultée par 3 directeurs de ports que nous n'aurions jamais rencontrés physiquement. Un ROI impossible à obtenir avec un stand classique.",
    name: 'Mehdi Ouarrach', role: 'CEO, PortLogix Solutions', initials: 'MO', color: '#0073F4',
  },
  {
    text: "Pour une PME comme nous, exposer à Tanger Med était un rêve inaccessible. Avec la formule Essentielle, nous avons eu la même visibilité numérique que des groupes dix fois plus grands.",
    name: 'Aminata Diallo', role: 'Directrice, WestPort Tech', initials: 'AD', color: '#000E91',
  },
  {
    text: "Le mode offline sur tablette a été décisif. Le Wi-Fi saturait dans les couloirs, mais nos brochures fonctionnaient parfaitement. Nos concurrents étaient bloqués.",
    name: 'Carlos Ferreira', role: 'VP Commercial, NavTech Ibérica', initials: 'CF', color: '#475569',
  },
]

const FAQS = [
  { q: "Qui gère les tablettes sur place ?", a: "COPAF prend en charge l'intégralité de la logistique : acquisition, préchargement, distribution aux délégués VIP et collecte en fin d'événement." },
  { q: "Comment fonctionne le mode offline ?", a: "Grâce à la technologie Service Worker, tous vos fichiers sont téléchargés avant l'événement. Les délégués y accèdent instantanément même sans Wi-Fi." },
  { q: "Comment le rapport est-il produit ?", a: "Chaque délégué est authentifié via son badge QR. Chaque consultation, téléchargement ou clic sur votre vitrine est tracé nominalement." },
  { q: "Ma vitrine reste-t-elle 12 mois en ligne ?", a: "Oui, sans frais supplémentaires. Votre page reste indexée sur le portail COPAF et accessible via Google pendant 12 mois." },
  { q: "Puis-je modifier mes contenus après l'upload ?", a: "Oui, jusqu'à 7 jours avant l'événement. Passé ce délai, les fichiers sont verrouillés pour le préchargement sur les tablettes." },
  { q: "Quelle est la date limite d'inscription ?", a: "30 jours avant la conférence. Il est conseillé de s'inscrire au moins 60 jours à l'avance pour une vitrine SEO optimisée." },
]

// ─── HELPERS BDD ─────────────────────────────────────────────────────────────

async function upsertContact({ email, nom, telephone, organisation, secteur, source }) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert(
      { email, nom, telephone, organisation, poste: secteur, source },
      { onConflict: 'email' }
    )
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

async function createExposant({ contactId, entreprise, secteur, forfait, goals }) {
  const { error } = await supabase.from('exposants').insert([{
    contact_id: contactId,
    entreprise,
    secteur,
    forfait,
    statut: 'nouveau',
    goals,
  }])
  if (error) throw new Error(error.message)
}

// ─── HOOK SCROLL REVEAL ──────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── SOUS-COMPOSANTS ─────────────────────────────────────────────────────────

function Section({ children, alt, id }) {
  const [ref, visible] = useScrollReveal()
  return (
    <section ref={ref} id={id} style={{
      padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)',
      background: alt ? '#f8faff' : '#fff',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: 'opacity .6s ease, transform .6s ease',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,56px)' }}>
      <div style={{
        display: 'inline-block', fontSize: 10, fontWeight: 800,
        color: '#0073F4', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10,
      }}>{eyebrow}</div>
      <h2 style={{ fontSize: 'clamp(22px,4.5vw,40px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {title}
      </h2>
      {sub && <p style={{ color: '#64748b', fontSize: 'clamp(14px,2vw,16px)', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>{sub}</p>}
    </div>
  )
}

function CheckItem({ text, color }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: color + '18', border: `1.5px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5 5 3.5 7.5 8.5 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>{text}</span>
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function ExpositionDigitale() {
  const [activeModal,   setActiveModal]   = useState(null)
  const [selectedPlan,  setSelectedPlan]  = useState('')
  const [openFaq,       setOpenFaq]       = useState(null)
  const [focused,       setFocused]       = useState('')
  const [floatVisible,  setFloatVisible]  = useState(false)
  const [formData,      setFormData]      = useState({ company:'', sector:'', name:'', role:'', email:'', phone:'', goals:'' })
  const [formError,     setFormError]     = useState('')
  const [formSent,      setFormSent]      = useState(false)
  const [loading,       setLoading]       = useState(false)

  useEffect(() => {
    const fn = () => setFloatVisible(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const handleField = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const inputStyle = name => ({
    width: '100%', padding: '13px 16px', fontSize: 15,
    fontFamily: 'inherit', color: '#0f172a',
    background: focused === name ? '#fff' : '#f8fafc',
    border: `1.5px solid ${focused === name ? '#0073F4' : '#e2e8f0'}`,
    borderRadius: 12, outline: 'none', transition: 'all .2s',
    boxSizing: 'border-box',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,115,244,.12)' : 'none',
    WebkitAppearance: 'none', appearance: 'none',
  })

  const foc = name => ({ onFocus: () => setFocused(name), onBlur: () => setFocused('') })

  const submitForm = async e => {
    e.preventDefault()
    setFormError('')
    if (!formData.company || !formData.name || !formData.email || !selectedPlan) {
      setFormError('Veuillez remplir : entreprise, nom, email et formule.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Adresse email invalide.')
      return
    }
    setLoading(true)
    try {
      const contactId = await upsertContact({
        email:        formData.email,
        nom:          formData.name,
        telephone:    formData.phone,
        organisation: formData.company,
        secteur:      formData.sector,
        source:       'exposant',
      })
      await createExposant({
        contactId,
        entreprise: formData.company,
        secteur:    formData.sector,
        forfait:    selectedPlan,
        goals:      formData.goals,
      })
      setFormSent(true)
    } catch (err) { setFormError('Erreur : ' + err.message) }
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0f172a', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes spin     { to   { transform:rotate(360deg); } }
        @keyframes pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes slideUp  { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }

        .fade-up   { animation: fadeUp  .5s ease both; }
        .fade-up-1 { animation: fadeUp  .5s .05s ease both; }
        .fade-up-2 { animation: fadeUp  .5s .15s ease both; }
        .fade-up-3 { animation: fadeUp  .5s .25s ease both; }
        .spinner   { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }

        /* Float CTA */
        .float-cta {
          position: fixed; bottom: 24px; right: 20px; z-index: 9999;
          background: #000E91; color: #fff; border: none;
          padding: 14px 24px; border-radius: 50px;
          font-family: inherit; font-weight: 800; font-size: 14px;
          cursor: pointer; box-shadow: 0 8px 24px rgba(0,14,145,.4);
          opacity: 0; transform: translateY(20px); pointer-events: none;
          transition: opacity .3s, transform .3s;
        }
        .float-cta.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .float-cta:hover { background: #0f1f8a; }

        /* Pilier cards */
        .pilier-card {
          background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 20px; padding: clamp(20px,4vw,32px);
          cursor: pointer; transition: all .28s cubic-bezier(.34,1.56,.64,1);
        }
        .pilier-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,115,244,.13); border-color: #0073F4; }
        .pilier-card:active { transform: scale(.98); }
        @media (max-width:520px) { .pilier-card:hover { transform: none; } }

        /* Grids */
        .piliers-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; }
        .temo-grid    { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
        .avantages-grid { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 14px; }
        @media (max-width:900px)  { .piliers-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .avantages-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width:700px)  { .pricing-grid { grid-template-columns: minmax(0,1fr); } .temo-grid { grid-template-columns: minmax(0,1fr); } }
        @media (max-width:540px)  { .piliers-grid { grid-template-columns: minmax(0,1fr); } .avantages-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }

        /* Comparaison table */
        .cmp-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .cmp-table th, .cmp-table td { padding: 14px 18px; }
        .cmp-table thead th { font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
        .cmp-table tbody td { border-bottom: 1px solid #f1f5f9; }
        .cmp-table tbody tr:last-child td { border-bottom: none; }
        .cmp-mobile { display: none; }
        @media (max-width:640px) { .cmp-table { display: none; } .cmp-mobile { display: flex; flex-direction: column; gap: 10px; } }

        /* Workflow */
        .workflow { display: flex; gap: 0; align-items: flex-start; }
        @media (max-width:640px) { .workflow { flex-direction: column; } }

        /* Form grid */
        .form-row-2 { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px; margin-bottom: 14px; }
        @media (max-width:520px) { .form-row-2 { grid-template-columns: minmax(0,1fr); } }

        /* Modale */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,.5); backdrop-filter: blur(6px);
          z-index: 10000; display: flex;
          align-items: flex-end; justify-content: center;
          animation: fadeIn .2s ease;
        }
        .modal-box {
          background: #fff; border-radius: 24px 24px 0 0;
          width: 100%; max-height: 88vh; padding: 36px 24px 48px;
          overflow-y: auto; position: relative;
          box-shadow: 0 -8px 40px rgba(0,0,0,.15);
          animation: slideUp .3s ease;
        }
        @media (min-width:640px) {
          .modal-overlay { align-items: center; padding: 24px; }
          .modal-box { border-radius: 24px; max-width: 520px; max-height: 80vh; padding: 44px; }
        }

        /* FAQ */
        .faq-item { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 10px; }
        .faq-q {
          padding: 18px 20px; font-weight: 700; font-size: 14px; color: #0f172a;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px;
          user-select: none; line-height: 1.4; transition: background .15s;
          WebkitTapHighlightColor: transparent;
        }
        .faq-q:hover { background: #f8fafc; }
        .faq-a { padding: 0 20px 18px; color: #64748b; font-size: 14px; line-height: 1.75; border-top: 1px solid #f1f5f9; padding-top: 14px; }

        /* Buttons */
        .btn-primary {
          background: linear-gradient(135deg,#0073F4,#000E91);
          color: #fff; border: none; border-radius: 14px;
          padding: 16px 28px; font-family: inherit; font-weight: 800;
          font-size: 15px; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,115,244,.3);
          transition: all .2s; white-space: nowrap;
        }
        .btn-primary:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 12px 32px rgba(0,115,244,.4); }
        .btn-primary:active { transform: translateY(0); }

        .btn-outline {
          background: transparent; color: #0f172a;
          border: 2px solid #e2e8f0; border-radius: 14px;
          padding: 14px 24px; font-family: inherit; font-weight: 700;
          font-size: 14px; cursor: pointer; transition: all .2s;
        }
        .btn-outline:hover { border-color: #0073F4; color: #0073F4; }

        .select-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          color: #fff; font-family: inherit; font-weight: 800;
          font-size: 14px; cursor: pointer; transition: all .2s;
          WebkitTapHighlightColor: transparent;
        }
        .select-btn:hover { opacity: .88; transform: translateY(-1px); }
        .select-btn:active { transform: translateY(0); }

        .submit-btn {
          width: 100%; padding: 16px; border: none; border-radius: 14px;
          background: linear-gradient(135deg,#0073F4,#000E91);
          color: #fff; font-family: inherit; font-weight: 800;
          font-size: 15px; cursor: pointer; transition: all .2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 8px 24px rgba(0,115,244,.3);
        }
        .submit-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

        @media (max-width:768px) { input, select, textarea { font-size: 16px !important; } }
      `}</style>

      {/* ── FLOAT CTA ── */}
      <button className={`float-cta ${floatVisible ? 'show' : ''}`} onClick={() => scrollTo('inscription')}>
        Réserver ma place →
      </button>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(80px,14vw,160px) clamp(16px,5vw,60px) clamp(60px,10vw,120px)',
        background: 'linear-gradient(160deg,#f0f6ff 0%,#fff 70%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:320, height:320, borderRadius:'50%', border:'60px solid rgba(0,115,244,.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-80, width:240, height:240, borderRadius:'50%', border:'40px solid rgba(0,14,145,.04)', pointerEvents:'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div className="fade-up" style={{
            display: 'inline-block', padding: '7px 18px',
            background: 'rgba(0,115,244,.1)', color: '#0073F4',
            borderRadius: 100, fontSize: 10, fontWeight: 800,
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 22,
          }}>
            TANGER MED · MAROC · 2026
          </div>

          <h1 className="fade-up-1" style={{
            fontSize: 'clamp(30px,7vw,60px)', fontWeight: 900,
            color: '#000E91', marginBottom: 18, lineHeight: 1.05, letterSpacing: '-0.03em',
          }}>
            L'Exposition{' '}
            <span style={{ background: 'linear-gradient(135deg,#0073F4,#000E91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              100% Digitale
            </span>
          </h1>

          <p className="fade-up-2" style={{ color: '#64748b', fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.75, marginBottom: 36 }}>
            Votre technologie directement dans les mains des décideurs portuaires — sans stand, sans logistique, avec plus d'impact.
          </p>

          <div className="fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => scrollTo('inscription')}>Réserver ma place</button>
            <button className="btn-outline" onClick={() => scrollTo('piliers')}>Comment ça marche ?</button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        background: '#000E91', padding: 'clamp(24px,4vw,36px) clamp(16px,5vw,60px)',
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center',
      }}>
        {STATS.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── AVANTAGES ── */}
      <Section alt>
        <SectionHeader eyebrow="Pourquoi digital ?" title="5 raisons de choisir l'exposition digitale" />
        <div className="avantages-grid">
          {AVANTAGES.map((a, i) => (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18,
              padding: 'clamp(18px,3vw,28px)', textAlign: 'center',
              transition: 'all .25s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,115,244,.1)'; e.currentTarget.style.borderColor = '#0073F4' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── COMPARAISON ── */}
      <Section>
        <SectionHeader eyebrow="Stand classique vs Digital" title="Un tableau qui convainc en 30 secondes" />

        {/* Desktop table */}
        <div style={{ overflowX: 'auto', borderRadius: 18, border: '1.5px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <table className="cmp-table">
            <thead>
              <tr style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', color: '#64748b', padding: '16px 18px' }}>Critère</th>
                <th style={{ background: '#fef2f2', color: '#991b1b', textAlign: 'center', borderLeft: '1px solid #fecaca' }}>Stand Physique</th>
                <th style={{ background: '#eff6ff', color: '#1e40af', textAlign: 'center', borderLeft: '1px solid #bfdbfe' }}>COPAF Digital ✓</th>
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

        {/* Mobile cards */}
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
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#1e40af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Digital ✓</div>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 700 }}>{row.digital}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4 PILIERS ── */}
      <Section alt id="piliers">
        <SectionHeader eyebrow="Le dispositif" title="4 piliers pour une présence maximale" sub="Cliquez sur chaque pilier pour découvrir les détails." />
        <div className="piliers-grid">
          {PILIERS.map(p => (
            <div key={p.id} className="pilier-card" onClick={() => setActiveModal(p)}>
              <div style={{ fontSize: 11, fontWeight: 900, color: p.color, letterSpacing: 1, marginBottom: 12 }}>PILIER {p.id}</div>
              <h3 style={{ fontSize: 'clamp(16px,2.5vw,20px)', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{p.short}</p>
              <div style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>En savoir plus →</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── WORKFLOW ── */}
      <Section>
        <SectionHeader eyebrow="Le parcours exposant" title="5 étapes, de l'inscription au rapport" />
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="workflow">
            {WORKFLOW.map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 0, flex: 1, flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Ligne connecteur */}
                {i < WORKFLOW.length - 1 && (
                  <div style={{
                    position: 'absolute', top: 22, left: '50%', width: '100%', height: 2,
                    background: 'linear-gradient(90deg,#0073F4,#000E91)', zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0073F4,#000E91)',
                  color: '#fff', fontWeight: 900, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, zIndex: 1, boxShadow: '0 4px 16px rgba(0,115,244,.3)',
                }}>
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
        <SectionHeader eyebrow="Nos formules" title="Choisissez votre niveau d'impact" sub="De la PME au leader mondial, un pack adapté à chaque stratégie." />
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: '#fff',
              border: `1.5px solid ${plan.featured ? plan.color : '#e2e8f0'}`,
              borderTop: `5px solid ${plan.color}`,
              borderRadius: 22, padding: 'clamp(24px,4vw,38px)',
              textAlign: 'center', position: 'relative',
              boxShadow: plan.featured ? `0 16px 48px ${plan.color}22` : '0 2px 8px rgba(0,0,0,.04)',
              transform: plan.featured ? 'scale(1.03)' : 'none',
              transition: 'all .25s',
            }}>
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff', fontSize: 11, fontWeight: 800,
                  padding: '4px 18px', borderRadius: 50, whiteSpace: 'nowrap',
                }}>
                  ⭐ {plan.tag}
                </div>
              )}
              {!plan.featured && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>{plan.tag}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 900, color: plan.color, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 }}>{plan.id}</div>
              <div style={{ fontSize: 'clamp(38px,8vw,54px)', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginBottom: 4 }}>
                {plan.price}<span style={{ fontSize: 20, verticalAlign: 'super' }}>€</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>paiement unique</div>

              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 28 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < plan.features.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: 13.5, color: '#334155' }}>
                    <span style={{ color: '#22c55e', fontWeight: 800, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="select-btn"
                style={{ background: `linear-gradient(135deg,${plan.color},${plan.color}cc)`, boxShadow: `0 6px 20px ${plan.color}30` }}
                onClick={() => { setSelectedPlan(plan.id); scrollTo('inscription') }}
              >
                Choisir {plan.id}
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TÉMOIGNAGES ── */}
      <Section>
        <SectionHeader eyebrow="Ils nous font confiance" title="Ce que disent nos participants" />
        <div className="temo-grid">
          {TEMOIGNAGES.map((t, i) => (
            <div key={i} style={{ background: '#f8faff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 'clamp(20px,3vw,28px)' }}>
              <div style={{ color: '#f59e0b', fontSize: 15, letterSpacing: 3, marginBottom: 14 }}>★★★★★</div>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0,
                }}>
                  {t.initials}
                </div>
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
        <SectionHeader eyebrow="Questions fréquentes" title="Tout ce que vous devez savoir" />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: openFaq === i ? '#0073F4' : '#f1f5f9',
                  color: openFaq === i ? '#fff' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0, fontWeight: 300,
                  transition: 'all .25s',
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                }}>+</div>
              </div>
              {openFaq === i && (
                <div className="faq-a">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── FORMULAIRE ── */}
      <section id="inscription" style={{
        padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,60px)',
        background: 'linear-gradient(150deg,#000E91,#0073F4)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(0,0,0,.08)', pointerEvents:'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{
            background: '#fff', borderRadius: 24,
            padding: 'clamp(24px,5vw,52px)',
            boxShadow: '0 24px 60px rgba(0,0,0,.2)',
          }}>
            {formSent ? (
              /* Succès */
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0073F4,#000E91)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 12px 32px rgba(0,14,145,.3)',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Demande reçue !</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>
                  Notre équipe COPAF vous contactera dans les <strong style={{ color: '#0073F4' }}>24 heures</strong> pour confirmer votre exposition.
                </p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Réservez votre exposition</h2>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>Soumettez votre demande pour COPAF 2026. Notre équipe vous contacte sous 24h.</p>
                </div>

                <form onSubmit={submitForm} noValidate>
                  <div className="form-row-2">
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Entreprise *</label>
                      <input name="company" value={formData.company} onChange={handleField} required placeholder="Ex : Port Tech Solutions" style={inputStyle('company')} {...foc('company')} autoComplete="organization" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Secteur</label>
                      <input name="sector" value={formData.sector} onChange={handleField} placeholder="Ex : Logistique portuaire" style={inputStyle('sector')} {...foc('sector')} />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Nom & Prénom *</label>
                      <input name="name" value={formData.name} onChange={handleField} required placeholder="Prénom Nom" style={inputStyle('name')} {...foc('name')} autoComplete="name" />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Poste</label>
                      <input name="role" value={formData.role} onChange={handleField} placeholder="Ex : Directeur Général" style={inputStyle('role')} {...foc('role')} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleField} required placeholder="contact@entreprise.com" style={inputStyle('email')} {...foc('email')} autoComplete="email" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Téléphone / WhatsApp</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleField} placeholder="+212 600 000 000" style={inputStyle('phone')} {...foc('phone')} autoComplete="tel" />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Formule souhaitée *</label>
                    <select
                      value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} required
                      style={{ ...inputStyle('plan'), cursor: 'pointer', color: selectedPlan ? '#0f172a' : '#94a3b8' }}
                      {...foc('plan')}
                    >
                      <option value="">-- Sélectionnez une formule --</option>
                      <option value="ESSENTIELLE">ESSENTIELLE — 500 €</option>
                      <option value="AVANCÉE">AVANCÉE — 1 500 €</option>
                      <option value="PREMIUM">PREMIUM — 3 000 €</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'#64748b', marginBottom:7 }}>Vos objectifs pour COPAF 2026</label>
                    <textarea name="goals" value={formData.goals} onChange={handleField} rows={3}
                      placeholder="Ex : Trouver des partenaires en Afrique de l'Ouest, présenter notre solution de tracking…"
                      style={{ ...inputStyle('goals'), resize: 'vertical', minHeight: 80 }} {...foc('goals')} />
                  </div>

                  {formError && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 18, lineHeight: 1.5 }}>
                      ⚠️ {formError}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <><div className="spinner" />Envoi en cours…</> : <>Envoyer ma demande →</>}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 14, lineHeight: 1.6 }}>
                    Notre équipe vous répondra sous 24h ouvrées.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#0a0f2c', padding: 'clamp(20px,4vw,32px) clamp(16px,5vw,60px)',
        textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.3)',
        letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.8,
      }}>
        © 2026 COPAF — Tanger Med · Exposition 100% Digitale · Tous droits réservés
      </footer>

      {/* ── MODALE PILIER ── */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: '#f1f5f9', border: 'none', width: 34, height: 34,
                borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>

            {/* Drag handle mobile */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 28px' }} />

            <div style={{ fontSize: 11, fontWeight: 800, color: activeModal.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              PILIER {activeModal.id}
            </div>
            <h2 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, color: '#0f172a', marginBottom: 14 }}>
              {activeModal.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75, marginBottom: 22 }}>
              {activeModal.full}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {activeModal.features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f8fafc', borderRadius: 50, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700, color: '#334155',
                }}>
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