import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import ReactGA from 'react-ga4'
import emailjs from '@emailjs/browser'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLClkSCepqlUnoshI8D01U_G4'
const PRIX_PARTICIPANT = 3500

const C = {
  navy:      '#000E91',
  navyLight: '#0A1AAF',
  navyDeep:  '#000770',
  blue:      '#0073F4',
  blueLight: '#3391F6',
  bluePale:  '#EBF3FF',
  blueMid:   '#C2DCFD',
  white:     '#FFFFFF',
  offWhite:  '#F5F8FF',
  navy10:    'rgba(0,14,145,0.10)',
  navy20:    'rgba(0,14,145,0.20)',
  blue15:    'rgba(0,115,244,0.15)',
  blue30:    'rgba(0,115,244,0.30)',
  blue08:    'rgba(0,115,244,0.08)',
  text:      '#1a2340',
  textMuted: '#4a5a8a',
  textLight: '#8a9cc4',
}

const TOUS_LES_PAYS = [
  { value: 'Bénin', label: '🇧🇯 Bénin' },
  { value: 'Togo', label: '🇹🇬 Togo' },
  { value: "Côte d'Ivoire", label: "🇨🇮 Côte d'Ivoire" },
  { value: 'Sénégal', label: '🇸🇳 Sénégal' },
  { value: 'Guinée', label: '🇬🇳 Guinée' },
  { value: 'Mauritanie', label: '🇲🇷 Mauritanie' },
  { value: 'Nigeria', label: '🇳🇬 Nigeria' },
  { value: 'Ghana', label: '🇬🇭 Ghana' },
  { value: 'Gambie', label: '🇬🇲 Gambie' },
  { value: 'Sierra Leone', label: '🇸🇱 Sierra Leone' },
  { value: 'Liberia', label: '🇱🇷 Liberia' },
  { value: 'Cameroun', label: '🇨🇲 Cameroun' },
  { value: 'Gabon', label: '🇬🇦 Gabon' },
  { value: 'Congo', label: '🇨🇬 Congo (Brazzaville)' },
  { value: 'RDC', label: '🇨🇩 RDC (Congo)' },
  { value: 'Guinée Équatoriale', label: '🇬🇶 Guinée Équatoriale' },
  { value: 'Angola', label: '🇦🇴 Angola' },
  { value: 'Cap-Vert', label: '🇨🇻 Cap-Vert' },
  { value: 'Guinée-Bissau', label: '🇬🇼 Guinée-Bissau' },
  { value: 'Sao Tomé-et-Principe', label: '🇸🇹 Sao Tomé-et-Principe' },
  { value: 'Afrique du Sud', label: '🇿🇦 Afrique du Sud' },
  { value: 'Algérie', label: '🇩🇿 Algérie' },
  { value: 'Maroc', label: '🇲🇦 Maroc' },
  { value: 'Tunisie', label: '🇹🇳 Tunisie' },
  { value: 'Égypte', label: '🇪🇬 Égypte' },
  { value: 'Kenya', label: '🇰🇪 Kenya' },
  { value: 'Tanzanie', label: '🇹🇿 Tanzanie' },
  { value: 'Émirats Arabes Unis', label: '🇦🇪 Émirats Arabes Unis' },
  { value: 'Arabie Saoudite', label: '🇸🇦 Arabie Saoudite' },
  { value: 'Chine', label: '🇨🇳 Chine' },
  { value: 'Inde', label: '🇮🇳 Inde' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Belgique', label: '🇧🇪 Belgique' },
  { value: 'Allemagne', label: '🇩🇪 Allemagne' },
  { value: 'Pays-Bas', label: '🇳🇱 Pays-Bas' },
  { value: 'États-Unis', label: '🇺🇸 États-Unis' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Brésil', label: '🇧🇷 Brésil' },
  { value: 'Autre', label: '🌍 Autre pays' },
]

const IconBadge = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="3" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
)

const IconDiamond = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l4 6-10 13L2 9z" />
    <path d="M2 9h20" />
    <path d="M12 22V9" />
    <path d="M6 3l6 6 6-6" />
  </svg>
)

const IconMonitor = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 10h10" />
    <path d="M7 7h4" />
  </svg>
)

const IconArrowRight = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="10" x2="16" y2="10" />
    <polyline points="11 5 16 10 11 15" />
  </svg>
)

const IconArrowLeft = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16" y1="10" x2="4" y2="10" />
    <polyline points="9 15 4 10 9 5" />
  </svg>
)

const IconCheck = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" />
    <polyline points="6.5 10 8.8 12.5 13.5 7.5" />
  </svg>
)

const IconCheckBig = ({ size = 32, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconCreditCard = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const IconCalendar = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
)

const IconPhone = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" />
  </svg>
)

const IconMail = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const IconGlobe = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const IconBank = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)

const IconExternalLink = ({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const TYPES_INSCRIPTION = [
  {
    id: 'participant',
    Icon: IconBadge,
    label: 'Participant',
    sublabel: 'Je participe à la conférence',
    desc: 'Ports, autorités portuaires, entreprises paraportuaires, logisticiens, shippers et tout professionnel du maritime.',
    prix: '3 500 €',
    tag: 'par personne',
    cta: "S'inscrire",
    redirect: false,
    accent: '#0073F4',
    bgIcon: '#EBF3FF',
    borderIcon: '#C2DCFD',
    cardBorder: '#C2DCFD',
    priceBg: '#EBF3FF',
    gradStart: '#0073F4',
    gradEnd: '#000E91',
  },
  {
    id: 'sponsor',
    Icon: IconDiamond,
    label: 'Sponsor / Partenaire',
    sublabel: 'Visibilité & partenariat institutionnel',
    desc: 'Sponsors Platine, Or, Argent, Bronze — ou partenariat institutionnel, média, académique. Package sur-mesure.',
    prix: 'Dès 8 000 €',
    tag: 'sponsors & partenaires',
    cta: 'Voir les offres',
    redirect: true,
    redirectTo: '/partenariats',
    accent: '#000E91',
    bgIcon: 'rgba(0,14,145,0.06)',
    borderIcon: 'rgba(0,14,145,0.20)',
    cardBorder: 'rgba(0,14,145,0.22)',
    priceBg: 'rgba(0,14,145,0.05)',
    gradStart: '#000E91',
    gradEnd: '#0073F4',
  },
  {
    id: 'exposant',
    Icon: IconMonitor,
    label: 'Exposant',
    sublabel: 'Vitrine digitale de vos solutions',
    desc: 'Exposition 100% digitale sur le site COPAF et les tablettes distribuées aux participants. 3 formules disponibles.',
    prix: 'Dès 500 €',
    tag: 'digital · site + tablettes',
    cta: 'Voir les formules',
    redirect: true,
    redirectTo: '/exposition-digitale',
    accent: '#3391F6',
    bgIcon: 'rgba(0,115,244,0.08)',
    borderIcon: 'rgba(0,115,244,0.28)',
    cardBorder: 'rgba(0,115,244,0.28)',
    priceBg: 'rgba(0,115,244,0.06)',
    gradStart: '#3391F6',
    gradEnd: '#000E91',
  },
]

const Inscription = () => {
  const navigate = useNavigate()
  const [etape, setEtape] = useState(1)
  const [typeChoisi, setTypeChoisi] = useState(null)
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    organisation: '', poste: '', pays: '', participants: '1', message: ''
  })
  const [paiementMode, setPaiementMode] = useState('maintenant')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [dossierNum, setDossierNum] = useState('')
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [rgpdAccepted, setRgpdAccepted] = useState(false)

  const nbParticipants = parseInt(form.participants) || 1
  const montantTotal = nbParticipants * PRIX_PARTICIPANT
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleTypeSelect = (type) => {
    setTypeChoisi(type)
    if (type.redirect) navigate(type.redirectTo)
    else setEtape(2)
  }

  const generateDossier = () => `COPAF2026-${Math.floor(Math.random() * 90000) + 10000}`

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const dossier = generateDossier()

    const { error } = await supabase.from('inscriptions').insert([{
      nom: form.nom, prenom: form.prenom, email: form.email,
      telephone: form.telephone, organisation: form.organisation,
      poste: form.poste, pays: form.pays,
      participants: nbParticipants, montant: montantTotal,
      tarif_agpaoc: false, message: form.message,
      paiement_status: paiementMode === 'maintenant' ? 'en_attente' : 'reserve', dossier,
    }])

    if (error) { setLoading(false); setErrorMsg('Une erreur est survenue : ' + error.message); return }

    try {
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant: montantTotal, dossier, paiement: paiementMode })
      })
    } catch (err) { console.log('Sheets:', err) }

    try {
      await emailjs.send('service_x07g4et', 'template_7wrkmm1', {
        prenom: form.prenom, nom: form.nom, email: form.email,
        organisation: form.organisation, poste: form.poste,
        pays: form.pays, participants: form.participants,
        montant: `${montantTotal.toLocaleString('fr-FR')} €`,
        tarif: `Tarif unique — ${PRIX_PARTICIPANT.toLocaleString('fr-FR')} €/pers.`,
        dossier,
        paiement_mode: paiementMode === 'maintenant' ? 'Paiement immédiat (7 jours)' : 'Réservation — paiement différé',
        paiement_maintenant: paiementMode === 'maintenant' ? 'true' : '',
        paiement_reserve: paiementMode === 'plus_tard' ? 'true' : '',
      }, 'zBZAZxCfznICTKLJK')
    } catch (err) { console.log('EmailJS:', err) }

    ReactGA.event({ category: 'Inscription', action: 'form_submit', label: form.pays, value: nbParticipants })
    setDossierNum(dossier)
    setLoading(false)
    setSubmitted(true)
  }

  const inputBase = {
    width: '100%',
    padding: '12px 14px',
    background: C.white,
    border: `1.5px solid ${C.blueMid}`,
    borderRadius: 10,
    color: C.text,
    fontFamily: 'inherit',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  }

  const labelBase = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 7,
  }

  const focusIn = e => {
    e.target.style.borderColor = C.blue
    e.target.style.boxShadow = `0 0 0 3px ${C.blue15}`
  }
  const focusOut = e => {
    e.target.style.borderColor = C.blueMid
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap');

        /* ── RESET OVERFLOW GLOBAL ── */
        *, *::before, *::after { box-sizing: border-box; }

        /*
          FIX PRINCIPAL : overflow-x: clip est plus fort que hidden.
          Il coupe les éléments positionnés en absolu qui débordent,
          sans créer de contexte de scroll comme le fait overflow: hidden.
          Cela stoppe le scroll horizontal causé par les décors ronds.
        */
        html {
          overflow-x: clip;
        }
        body {
          overflow-x: clip;
          max-width: 100%;
        }

        /* ── CARTES ÉTAPE 1 ── */
        .insc-card {
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.22s ease,
                      border-color 0.22s ease;
          /* Empêche tout contenu interne de déborder la carte */
          overflow: hidden;
          /* Garantit que la carte ne dépasse pas son conteneur grid */
          min-width: 0;
          width: 100%;
        }
        .insc-card:hover { transform: translateY(-7px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .insc-fade   { animation: fadeUp 0.4s ease forwards; }
        .insc-fade-1 { animation: fadeUp 0.4s ease 0.05s both; }
        .insc-fade-2 { animation: fadeUp 0.4s ease 0.15s both; }
        .insc-fade-3 { animation: fadeUp 0.4s ease 0.25s both; }

        /* ── GRID ÉTAPE 1 ── */
        .insc-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          /* min-width: 0 sur le conteneur grid pour que les enfants
             ne puissent pas le faire grossir */
          min-width: 0;
        }

        /* Tablette : 2 colonnes, la 3e carte prend toute la largeur */
        @media (max-width: 860px) {
          .insc-cards-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
          .insc-card-last {
            grid-column: 1 / -1;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
          }
        }

        /* Mobile : 1 colonne, plus de hover (évite le layout shift au touch) */
        @media (max-width: 520px) {
          .insc-cards-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
          }
          .insc-card-last {
            grid-column: auto;
            max-width: 100%;
          }
          /* Désactive l'animation de survol sur mobile (touch = pas de hover fiable) */
          .insc-card:hover { transform: none; }
          /* Feedback tactile via active */
          .insc-card:active { transform: scale(0.98); }
        }

        /* ── PRIX ── */
        .insc-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ── GRID FORMULAIRE (form + sidebar) ── */
        .insc-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 28px;
          align-items: start;
          width: 100%;
          /* min-width: 0 critique pour que le grid ne force pas son
             propre agrandissement sur les petits écrans */
          min-width: 0;
        }
        @media (max-width: 860px) {
          .insc-form-grid {
            /* Sur mobile/tablette : 1 colonne, sidebar passe en dessous */
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── CHAMPS 2 COLONNES dans le formulaire ── */
        .insc-field-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 14px;
          margin-bottom: 16px;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 520px) {
          .insc-field-row {
            /* 1 seul champ par ligne sur petit mobile */
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── BOUTONS MODE PAIEMENT ── */
        .insc-pay-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 420px) {
          .insc-pay-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── SIDEBAR ── */
        .insc-sidebar {
          position: sticky;
          top: 100px;
          width: 100%;
          /* min-width: 0 pour que la sidebar ne déborde pas */
          min-width: 0;
        }
        @media (max-width: 860px) {
          .insc-sidebar {
            position: static;
          }
        }

        /* ── CHECKBOX ── */
        .insc-check-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: ${C.textMuted};
          line-height: 1.5;
          margin-bottom: 12px;
          /* Empêche le texte long de déborder sur mobile */
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .insc-check-label input[type="checkbox"] {
          margin-top: 2px;
          accent-color: ${C.blue};
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }

        /* ── BOUTON SUBMIT ── */
        .insc-submit-btn {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, ${C.blue}, ${C.navy});
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.3px;
          box-sizing: border-box;
          /* Garantit que le bouton ne déborde pas son parent */
          max-width: 100%;
          overflow: hidden;
        }
        .insc-submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .insc-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .insc-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── SPINNER ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .insc-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* ── INPUTS : empêche le zoom iOS sur focus (min 16px) ── */
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }

        /* ── TEXTES LONGS : word-break global pour les éléments dans les cartes ── */
        .insc-card p,
        .insc-card span,
        .insc-card div {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* ── BADGE "Page dédiée" : ne dépasse pas sur mobile ── */
        .insc-badge-redirect {
          position: absolute;
          top: 14px;
          right: 14px;
          background: ${C.bluePale};
          border: 1px solid ${C.blueMid};
          border-radius: 20px;
          padding: 3px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: ${C.blue};
          font-weight: 700;
          letter-spacing: 0.5px;
          /* Ne déborde pas de la carte */
          max-width: calc(100% - 28px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <section
        id="inscription"
        style={{
          padding: 'clamp(60px, 10vw, 120px) 0',
          background: C.offWhite,
          fontFamily: "'Outfit', 'Roboto', sans-serif",
          position: 'relative',
          minHeight: '100vh',
          /* overflow: hidden ici empêche les décors absolus de créer
             un scrollbar horizontal dans la section elle-même */
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >

        {/* ── DÉCORS DE FOND ──
            CORRECTION : tailles réduites + valeurs négatives minimisées
            pour éviter tout débordement visible sur mobile.
            Le overflow:hidden de la section + overflow-x:clip sur html
            les coupe proprement. */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          /* Pas d'overflow:'hidden' ici — inutile sur un div inset:0 */
          backgroundImage: `
            radial-gradient(circle at 15% 20%, ${C.blue15} 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(0,14,145,0.08) 0%, transparent 45%)
          `,
        }} />

        {/* Décor cercle haut-droite — réduit pour ne pas déborder sur mobile */}
        <div style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: `40px solid ${C.blue08}`,
          pointerEvents: 'none',
          /* Pas d'overflow:'hidden' sur ce div : ça ne sert à rien
             sur un élément non-scroll, et ça peut gêner le clip parent */
        }} />

        {/* Décor cercle bas-gauche — réduit */}
        <div style={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: `30px solid ${C.navy10}`,
          pointerEvents: 'none',
        }} />

        {/* ── WRAPPER PRINCIPAL ── */}
        <div style={{
          position: 'relative',
          maxWidth: 1160,
          margin: '0 auto',
          /* clamp garantit un padding adaptatif sans overflow */
          padding: '0 clamp(16px, 5vw, 60px)',
          boxSizing: 'border-box',
          width: '100%',
          /* min-width: 0 pour que ce div ne force pas un agrandissement
             au-delà de son conteneur */
          minWidth: 0,
        }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 64px)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.navy, borderRadius: 100,
              padding: '7px 22px', marginBottom: 22,
              /* Empêche ce pill de déborder sur très petit écran */
              maxWidth: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue, flexShrink: 0 }} />
              <span style={{
                color: C.white, fontSize: 11, fontWeight: 700,
                letterSpacing: 3, textTransform: 'uppercase',
              }}>
                Rejoindre la COPAF 2026
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(22px, 4.5vw, 52px)',
              fontWeight: 900,
              color: C.navy,
              marginBottom: 16,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              /* word-break pour éviter qu'un long mot déborde sur mobile */
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}>
              {etape === 1
                ? <>Choisissez votre{' '}
                    <span style={{
                      background: `linear-gradient(135deg, ${C.blue}, ${C.navyLight})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>type de participation</span>
                  </>
                : <>Inscription{' '}
                    <span style={{
                      background: `linear-gradient(135deg, ${C.blue}, ${C.navyLight})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>Participant</span>
                  </>
              }
            </h2>

            <p style={{
              fontSize: 'clamp(14px, 2vw, 17px)',
              color: C.textMuted,
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.8,
              fontWeight: 300,
            }}>
              {etape === 1
                ? 'Sélectionnez la catégorie correspondant à votre profil pour accéder au bon formulaire.'
                : 'Remplissez le formulaire ci-dessous. Paiement sécurisé par virement bancaire.'
              }
            </p>

            {etape === 2 && (
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, marginTop: 22,
                /* Sur mobile, les éléments passent à la ligne */
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setEtape(1)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: C.blue, fontSize: 13, fontWeight: 600,
                    padding: '6px 14px', borderRadius: 8,
                    transition: 'background 0.2s', fontFamily: 'inherit',
                    /* Zone de tap suffisante sur mobile */
                    minHeight: 44,
                    minWidth: 44,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blue08}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <IconArrowLeft color={C.blue} />
                  Changer de catégorie
                </button>
                <span style={{ color: C.blueMid, fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, color: C.textLight }}>
                  Participant · 3 500 € / personne
                </span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              ÉTAPE 1 — 3 CARTES DE SÉLECTION
          ══════════════════════════════════════════════════════════ */}
          {etape === 1 && (
            <div className="insc-cards-grid insc-fade">
              {TYPES_INSCRIPTION.map((type, idx) => {
                const { Icon } = type
                return (
                  <div
                    key={type.id}
                    className={`insc-card insc-fade-${idx + 1}${idx === 2 ? ' insc-card-last' : ''}`}
                    onClick={() => handleTypeSelect(type)}
                    style={{
                      background: C.white,
                      border: `2px solid ${type.cardBorder}`,
                      borderRadius: 22,
                      boxShadow: `0 4px 28px ${C.navy10}`,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      /* min-width: 0 + width: 100% = la carte reste dans
                         sa cellule grid sans jamais déborder */
                      minWidth: 0,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 20px 56px ${type.accent}28`
                      e.currentTarget.style.borderColor = type.accent
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = `0 4px 28px ${C.navy10}`
                      e.currentTarget.style.borderColor = type.cardBorder
                    }}
                  >
                    {/* Barre colorée en haut */}
                    <div style={{
                      height: 5,
                      background: `linear-gradient(90deg, ${type.gradStart}, ${type.gradEnd})`,
                      borderRadius: '20px 20px 0 0',
                      flexShrink: 0,
                    }} />

                    <div style={{
                      padding: 'clamp(16px, 4vw, 32px)',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      /* min-width: 0 pour que les enfants flex respectent
                         la largeur du parent */
                      minWidth: 0,
                    }}>

                      {/* Badge "Page dédiée" */}
                      {type.redirect && (
                        <div className="insc-badge-redirect">
                          Page dédiée
                          <IconExternalLink size={10} color={C.blue} />
                        </div>
                      )}

                      {/* Icône */}
                      <div style={{
                        width: 54, height: 54,
                        borderRadius: 15,
                        background: type.bgIcon,
                        border: `1.5px solid ${type.borderIcon}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 18,
                        marginTop: 6,
                        flexShrink: 0,
                      }}>
                        <Icon size={24} color={type.accent} />
                      </div>

                      {/* Titre */}
                      <div style={{
                        fontSize: 'clamp(15px, 2vw, 20px)',
                        fontWeight: 900,
                        color: C.navy,
                        marginBottom: 4,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}>
                        {type.label}
                      </div>

                      {/* Sous-titre */}
                      <div style={{
                        fontSize: 12, fontWeight: 700,
                        color: type.accent,
                        marginBottom: 14, letterSpacing: 0.4,
                        wordBreak: 'break-word',
                      }}>
                        {type.sublabel}
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: 13.5, color: C.textMuted,
                        lineHeight: 1.75, marginBottom: 22, flexGrow: 1,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        margin: '0 0 22px 0',
                      }}>
                        {type.desc}
                      </p>

                      {/* Bloc prix */}
                      <div style={{
                        background: type.priceBg,
                        border: `1.5px solid ${type.cardBorder}`,
                        borderRadius: 12,
                        padding: '12px 16px',
                        marginBottom: 16,
                        minWidth: 0,
                      }}>
                        <div className="insc-price-row">
                          <span style={{
                            fontSize: 'clamp(15px, 2.5vw, 20px)',
                            fontWeight: 900,
                            color: C.navy,
                            /* Empêche le prix de déborder */
                            wordBreak: 'break-word',
                          }}>
                            {type.prix}
                          </span>
                          <span style={{
                            fontSize: 11, color: C.textLight,
                            fontWeight: 600, textAlign: 'right',
                            wordBreak: 'break-word',
                          }}>
                            {type.tag}
                          </span>
                        </div>
                      </div>

                      {/* Bouton CTA */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 18px',
                        background: `linear-gradient(135deg, ${type.gradStart}, ${type.gradEnd})`,
                        borderRadius: 12,
                        color: C.white, fontSize: 13, fontWeight: 700,
                        gap: 8,
                        /* Garantit que ce bloc ne dépasse pas */
                        minWidth: 0,
                        overflow: 'hidden',
                      }}>
                        <span style={{ wordBreak: 'break-word', minWidth: 0 }}>{type.cta}</span>
                        <IconArrowRight size={16} color="#fff" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              ÉTAPE 2 — FORMULAIRE + SIDEBAR
          ══════════════════════════════════════════════════════════ */}
          {etape === 2 && (
            <div className="insc-form-grid insc-fade">

              {/* ── BLOC FORMULAIRE PRINCIPAL ── */}
              <div style={{
                background: C.white,
                border: `1.5px solid ${C.blueMid}`,
                borderRadius: 24,
                padding: 'clamp(18px, 5vw, 48px)',
                boxShadow: `0 12px 56px ${C.navy10}`,
                /* min-width: 0 indispensable dans un grid pour éviter
                   que le contenu force l'agrandissement de la colonne */
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}>

                {submitted ? (
                  /* ── ÉCRAN DE SUCCÈS ── */
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{
                      width: 76, height: 76, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 22px',
                      boxShadow: `0 12px 36px ${C.blue30}`,
                      flexShrink: 0,
                    }}>
                      <IconCheckBig />
                    </div>

                    <h3 style={{
                      fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 900,
                      color: C.navy, marginBottom: 8, letterSpacing: '-0.01em',
                      wordBreak: 'break-word',
                    }}>
                      {paiementMode === 'maintenant' ? 'Inscription confirmée !' : 'Place réservée !'}
                    </h3>

                    <p style={{
                      fontSize: 14, color: C.textMuted, marginBottom: 24,
                      lineHeight: 1.75, fontWeight: 300,
                      wordBreak: 'break-word',
                    }}>
                      Merci <strong style={{ color: C.navy }}>{form.prenom} {form.nom}</strong>.<br />
                      {paiementMode === 'maintenant'
                        ? <>Instructions de virement à <strong style={{ color: C.blue }}>{form.email}</strong> sous 24h.</>
                        : <>Votre place est réservée. Réglez avant le <strong style={{ color: C.blue }}>1er Août 2026</strong>.</>
                      }
                    </p>

                    {/* Numéro de dossier */}
                    <div style={{
                      background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                      borderRadius: 16, padding: '20px 32px', marginBottom: 24,
                      display: 'inline-block',
                      boxShadow: `0 10px 32px ${C.navy20}`,
                      /* Sur très petit écran, le numéro passe à la ligne correctement */
                      maxWidth: '100%',
                      wordBreak: 'break-all',
                    }}>
                      <div style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.55)',
                        letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8,
                      }}>
                        Numéro de dossier
                      </div>
                      <div style={{
                        fontSize: 'clamp(16px, 4vw, 24px)',
                        fontWeight: 900, color: C.white, letterSpacing: 2,
                      }}>
                        {dossierNum}
                      </div>
                    </div>

                    {/* Récapitulatif */}
                    <div style={{
                      background: C.offWhite,
                      border: `1.5px solid ${C.blueMid}`,
                      borderRadius: 14, padding: '18px 22px', marginBottom: 24,
                      textAlign: 'left',
                    }}>
                      <div style={{
                        fontSize: 10, color: C.blue, fontWeight: 700,
                        letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14,
                      }}>
                        Récapitulatif
                      </div>
                      {[
                        { l: 'Participants', v: form.participants },
                        { l: 'Tarif unitaire', v: `${PRIX_PARTICIPANT.toLocaleString('fr-FR')} €` },
                      ].map((r, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 14, color: C.textMuted,
                          paddingBottom: 8, borderBottom: `1px solid ${C.bluePale}`, marginBottom: 8,
                          gap: 8, flexWrap: 'wrap',
                        }}>
                          <span>{r.l}</span>
                          <strong style={{ color: C.navy }}>{r.v}</strong>
                        </div>
                      ))}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 17, fontWeight: 900, color: C.navy,
                        gap: 8, flexWrap: 'wrap',
                      }}>
                        <span>Total</span>
                        <span>{montantTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

                    {/* Étapes suivantes */}
                    <div style={{ textAlign: 'left' }}>
                      {(paiementMode === 'maintenant' ? [
                        'Email de confirmation envoyé',
                        'Instructions de virement reçues sous 24h',
                        'Règlement sous 7 jours ouvrés',
                        'Badge & accès participant envoyés après paiement',
                        'Informations logistiques partagées',
                      ] : [
                        'Email de confirmation de réservation envoyé',
                        'Rappel de paiement à J+3, J+7, J+14',
                        'Instructions de virement disponibles sur demande',
                        'Badge & accès participant après paiement',
                        'Informations logistiques partagées',
                      ]).map((step, i, arr) => (
                        <div key={i} style={{
                          display: 'flex', gap: 10, alignItems: 'flex-start',
                          padding: '9px 0',
                          borderBottom: i < arr.length - 1 ? `1px solid ${C.bluePale}` : 'none',
                          fontSize: 13.5, color: C.textMuted,
                        }}>
                          <span style={{ color: C.blue, flexShrink: 0, marginTop: 1 }}>
                            <IconCheck color={C.blue} />
                          </span>
                          <span style={{ wordBreak: 'break-word' }}>{step}</span>
                        </div>
                      ))}
                    </div>

                    {paiementMode === 'plus_tard' && (
                      <div style={{
                        background: C.bluePale,
                        border: `1px solid ${C.blueMid}`,
                        borderRadius: 10, padding: '13px 16px', marginTop: 20,
                        fontSize: 13, color: C.navy, textAlign: 'left', lineHeight: 1.65,
                        wordBreak: 'break-word',
                      }}>
                        ⚠️ Votre place est réservée mais <strong>non confirmée</strong> jusqu'au paiement.
                        Sans règlement avant le 1er Août 2026, votre réservation sera annulée.
                      </div>
                    )}
                  </div>

                ) : (
                  /* ── FORMULAIRE ── */
                  <form onSubmit={handleSubmit} style={{ minWidth: 0, width: '100%' }}>
                    <h3 style={{
                      fontSize: 20, fontWeight: 900, color: C.navy,
                      marginBottom: 28, textAlign: 'center', letterSpacing: '-0.02em',
                    }}>
                      Formulaire d'inscription
                    </h3>

                    {/* Nom / Prénom */}
                    <div className="insc-field-row">
                      {[
                        { name: 'nom', label: 'Nom *', placeholder: 'Votre nom' },
                        { name: 'prenom', label: 'Prénom *', placeholder: 'Votre prénom' },
                      ].map(field => (
                        <div key={field.name} style={{ minWidth: 0 }}>
                          <label style={labelBase}>{field.label}</label>
                          <input
                            name={field.name} type="text"
                            value={form[field.name]} onChange={handleChange}
                            required placeholder={field.placeholder}
                            style={inputBase} onFocus={focusIn} onBlur={focusOut}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Email / Téléphone */}
                    <div className="insc-field-row">
                      {[
                        { name: 'email', label: 'Email *', placeholder: 'votre@email.com', type: 'email' },
                        { name: 'telephone', label: 'Téléphone *', placeholder: '+229 01 XX XX XX' },
                      ].map(field => (
                        <div key={field.name} style={{ minWidth: 0 }}>
                          <label style={labelBase}>{field.label}</label>
                          <input
                            name={field.name} type={field.type || 'tel'}
                            value={form[field.name]} onChange={handleChange}
                            required placeholder={field.placeholder}
                            style={inputBase} onFocus={focusIn} onBlur={focusOut}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Organisation / Poste */}
                    <div className="insc-field-row">
                      {[
                        { name: 'organisation', label: 'Organisation *', placeholder: 'Port / Entreprise' },
                        { name: 'poste', label: 'Poste *', placeholder: 'Votre fonction' },
                      ].map(field => (
                        <div key={field.name} style={{ minWidth: 0 }}>
                          <label style={labelBase}>{field.label}</label>
                          <input
                            name={field.name} type="text"
                            value={form[field.name]} onChange={handleChange}
                            required placeholder={field.placeholder}
                            style={inputBase} onFocus={focusIn} onBlur={focusOut}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pays / Nombre de participants */}
                    <div className="insc-field-row">
                      <div style={{ minWidth: 0 }}>
                        <label style={labelBase}>Pays *</label>
                        <select
                          name="pays" value={form.pays} onChange={handleChange} required
                          style={{
                            ...inputBase,
                            cursor: 'pointer',
                            color: form.pays ? C.text : C.textLight,
                            /* Sur iOS, le select peut déborder — on force la largeur */
                            maxWidth: '100%',
                          }}
                          onFocus={focusIn} onBlur={focusOut}
                        >
                          <option value="" disabled>Sélectionnez votre pays</option>
                          {TOUS_LES_PAYS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <label style={labelBase}>Participants</label>
                        <select
                          name="participants" value={form.participants} onChange={handleChange}
                          style={{ ...inputBase, cursor: 'pointer', maxWidth: '100%' }}
                          onFocus={focusIn} onBlur={focusOut}
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>
                              {n} participant{n > 1 ? 's' : ''} — {(n * PRIX_PARTICIPANT).toLocaleString('fr-FR')} €
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div style={{ marginBottom: 22 }}>
                      <label style={labelBase}>Message / Besoins spécifiques</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange}
                        placeholder="Questions, besoins alimentaires, accessibilité..." rows={3}
                        style={{ ...inputBase, resize: 'vertical' }}
                        onFocus={focusIn} onBlur={focusOut}
                      />
                    </div>

                    {/* Mode de paiement */}
                    <div style={{ marginBottom: 22 }}>
                      <label style={labelBase}>Mode de paiement *</label>
                      <div className="insc-pay-grid">
                        {[
                          {
                            value: 'maintenant',
                            Icon: IconCreditCard,
                            title: 'Payer maintenant',
                            desc: 'Virement sous 7 jours',
                          },
                          {
                            value: 'plus_tard',
                            Icon: IconCalendar,
                            title: 'Réserver ma place',
                            desc: 'Paiement avant le 1er Août',
                          },
                        ].map(opt => {
                          const active = paiementMode === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPaiementMode(opt.value)}
                              style={{
                                background: active ? C.bluePale : C.white,
                                border: `2px solid ${active ? C.blue : C.blueMid}`,
                                borderRadius: 12, padding: '14px 16px',
                                cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.18s', fontFamily: 'inherit',
                                display: 'flex', flexDirection: 'column', gap: 6,
                                /* Zone de tap suffisante */
                                minHeight: 60,
                                width: '100%',
                                boxSizing: 'border-box',
                                minWidth: 0,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <opt.Icon size={20} color={active ? C.blue : C.textMuted} />
                                <span style={{
                                  fontSize: 13, fontWeight: 700,
                                  color: active ? C.navy : C.text,
                                  wordBreak: 'break-word',
                                }}>
                                  {opt.title}
                                </span>
                              </div>
                              <span style={{
                                fontSize: 11.5, color: C.textMuted,
                                lineHeight: 1.4, wordBreak: 'break-word',
                              }}>
                                {opt.desc}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Checkboxes CGV / RGPD */}
                    <div style={{ marginBottom: 24 }}>
                      <label className="insc-check-label">
                        <input
                          type="checkbox" checked={cgvAccepted}
                          onChange={e => setCgvAccepted(e.target.checked)} required
                        />
                        <span>
                          J'accepte les{' '}
                          <a href="/cgv" style={{ color: C.blue, fontWeight: 600 }}>
                            conditions générales de vente
                          </a>{' '}
                          et les modalités d'inscription.
                        </span>
                      </label>
                      <label className="insc-check-label">
                        <input
                          type="checkbox" checked={rgpdAccepted}
                          onChange={e => setRgpdAccepted(e.target.checked)} required
                        />
                        <span>
                          J'accepte le traitement de mes données conformément à la{' '}
                          <a href="/confidentialite" style={{ color: C.blue, fontWeight: 600 }}>
                            politique de confidentialité
                          </a>.
                        </span>
                      </label>
                    </div>

                    {/* Message d'erreur */}
                    {errorMsg && (
                      <div style={{
                        background: '#FFF0F0', border: '1.5px solid #FFBDBD',
                        borderRadius: 10, padding: '12px 16px',
                        fontSize: 13, color: '#C0392B', marginBottom: 18,
                        wordBreak: 'break-word',
                      }}>
                        {errorMsg}
                      </div>
                    )}

                    {/* Bouton de soumission */}
                    <button
                      type="submit"
                      className="insc-submit-btn"
                      disabled={loading || !cgvAccepted || !rgpdAccepted}
                    >
                      {loading ? (
                        <><div className="insc-spinner" /> Envoi en cours…</>
                      ) : (
                        <>
                          {paiementMode === 'maintenant' ? 'Confirmer mon inscription' : 'Réserver ma place'}
                          <IconArrowRight size={16} color="#fff" />
                        </>
                      )}
                    </button>

                    <p style={{
                      textAlign: 'center', fontSize: 12,
                      color: C.textLight, marginTop: 14, lineHeight: 1.6,
                    }}>
                      Paiement 100% sécurisé par virement bancaire.<br />
                      Aucun paiement en ligne requis à cette étape.
                    </p>
                  </form>
                )}
              </div>

              {/* ── SIDEBAR ── */}
              <div className="insc-sidebar">

                {/* Récapitulatif tarif */}
                <div style={{
                  background: C.white,
                  border: `1.5px solid ${C.blueMid}`,
                  borderRadius: 20,
                  padding: '28px 24px',
                  boxShadow: `0 8px 40px ${C.navy10}`,
                  marginBottom: 18,
                  /* Empêche la sidebar de déborder son conteneur */
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    fontSize: 10, color: C.blue, fontWeight: 700,
                    letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 18,
                  }}>
                    Récapitulatif
                  </div>

                  {[
                    { l: 'Participants', v: `${nbParticipants}` },
                    { l: 'Tarif unitaire', v: `${PRIX_PARTICIPANT.toLocaleString('fr-FR')} €` },
                  ].map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: 14, color: C.textMuted,
                      padding: '10px 0',
                      borderBottom: `1px solid ${C.bluePale}`,
                      gap: 8, flexWrap: 'wrap',
                    }}>
                      <span>{r.l}</span>
                      <strong style={{ color: C.navy }}>{r.v}</strong>
                    </div>
                  ))}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: 16, padding: '14px 16px',
                    background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                    borderRadius: 12,
                    gap: 8, flexWrap: 'wrap',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>
                      Total
                    </span>
                    <span style={{
                      fontSize: 'clamp(18px, 3vw, 22px)',
                      fontWeight: 900, color: C.white,
                    }}>
                      {montantTotal.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>

                {/* Paiement par virement */}
                <div style={{
                  background: C.white,
                  border: `1.5px solid ${C.blueMid}`,
                  borderRadius: 20,
                  padding: '24px',
                  boxShadow: `0 8px 40px ${C.navy10}`,
                  marginBottom: 18,
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: C.bluePale,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <IconBank size={18} color={C.blue} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                      Paiement par virement
                    </div>
                  </div>

                  {[
                    { label: 'Banque', value: 'SGBÉ Bénin' },
                    { label: 'IBAN', value: 'BJ66 BJ083 01001 00050273980 97' },
                    { label: 'BIC', value: 'SGBEBJ BX' },
                    { label: 'Titulaire', value: 'COPAF 2026' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      gap: 8, padding: '8px 0',
                      borderBottom: i < 3 ? `1px solid ${C.bluePale}` : 'none',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: 12, color: C.textLight, fontWeight: 600, flexShrink: 0,
                      }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: 12, color: C.navy, fontWeight: 700,
                        textAlign: 'right',
                        /* IBAN long : autorise le retour à la ligne */
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bloc contact */}
                <div style={{
                  background: C.bluePale,
                  border: `1.5px solid ${C.blueMid}`,
                  borderRadius: 18, padding: '20px 22px',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    fontSize: 10, color: C.navy, fontWeight: 700,
                    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14,
                  }}>
                    Besoin d'aide ?
                  </div>
                  {[
                    { Icon: IconPhone, text: '+229 01 97 67 22 00' },
                    { Icon: IconMail, text: 'inscriptions@copaf-ports.com' },
                    { Icon: IconGlobe, text: 'www.copaf-ports.com' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 9,
                      fontSize: 13, color: C.navy, fontWeight: 500,
                      marginBottom: i < 2 ? 10 : 0,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      <span style={{ flexShrink: 0, marginTop: 2 }}>
                        <item.Icon size={15} color={C.blue} />
                      </span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Inscription