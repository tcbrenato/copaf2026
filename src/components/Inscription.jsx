import { useState } from 'react'
import { supabase } from '../supabase'
import ReactGA from 'react-ga4'
import emailjs from '@emailjs/browser'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLClkSCepqlUnoshI8D01U_G4'

const PRIX_STANDARD = 5000
const PRIX_AGPAOC = 4500

// Liste complète des pays AGPAOC
const PAYS_AGPAOC = [
  // Anglophones
  'Nigeria', 'Ghana', 'Gambia', 'Sierra Leone', 'Liberia',
  // Francophones Afrique de l'Ouest
  'Bénin', 'Togo', "Côte d'Ivoire", 'Sénégal', 'Guinée', 'Mauritanie',
  // Afrique Centrale
  'Cameroun', 'Gabon', 'Congo', 'RDC', 'République Démocratique du Congo', 'Guinée Équatoriale',
  // Lusophones
  'Angola', 'Cap-Vert', 'Guinée-Bissau', 'Sao Tomé-et-Principe',
]

// Liste complète pour le select
const TOUS_LES_PAYS = [
  // AGPAOC en premier avec indicateur
  { value: 'Bénin', label: '🇧🇯 Bénin', agpaoc: true },
  { value: 'Togo', label: '🇹🇬 Togo', agpaoc: true },
  { value: "Côte d'Ivoire", label: "🇨🇮 Côte d'Ivoire", agpaoc: true },
  { value: 'Sénégal', label: '🇸🇳 Sénégal', agpaoc: true },
  { value: 'Guinée', label: '🇬🇳 Guinée', agpaoc: true },
  { value: 'Mauritanie', label: '🇲🇷 Mauritanie', agpaoc: true },
  { value: 'Nigeria', label: '🇳🇬 Nigeria', agpaoc: true },
  { value: 'Ghana', label: '🇬🇭 Ghana', agpaoc: true },
  { value: 'Gambia', label: '🇬🇲 Gambie', agpaoc: true },
  { value: 'Sierra Leone', label: '🇸🇱 Sierra Leone', agpaoc: true },
  { value: 'Liberia', label: '🇱🇷 Liberia', agpaoc: true },
  { value: 'Cameroun', label: '🇨🇲 Cameroun', agpaoc: true },
  { value: 'Gabon', label: '🇬🇦 Gabon', agpaoc: true },
  { value: 'Congo', label: '🇨🇬 Congo (Brazzaville)', agpaoc: true },
  { value: 'RDC', label: '🇨🇩 RDC (Congo)', agpaoc: true },
  { value: 'Guinée Équatoriale', label: '🇬🇶 Guinée Équatoriale', agpaoc: true },
  { value: 'Angola', label: '🇦🇴 Angola', agpaoc: true },
  { value: 'Cap-Vert', label: '🇨🇻 Cap-Vert', agpaoc: true },
  { value: 'Guinée-Bissau', label: '🇬🇼 Guinée-Bissau', agpaoc: true },
  { value: 'Sao Tomé-et-Principe', label: '🇸🇹 Sao Tomé-et-Principe', agpaoc: true },
  // Séparateur puis autres pays
  { value: '---', label: '─── Autres pays ───', agpaoc: false, disabled: true },

  // Afrique (non-AGPAOC) avec ports
  { value: 'Afrique du Sud', label: '🇿🇦 Afrique du Sud (Durban, Cape Town, Port Elizabeth)', agpaoc: false },
  { value: 'Algérie', label: '🇩🇿 Algérie (Alger, Oran, Annaba)', agpaoc: false },
  { value: 'Comores', label: '🇰🇲 Comores (Moroni)', agpaoc: false },
  { value: 'Djibouti', label: '🇩🇯 Djibouti (Port de Djibouti)', agpaoc: false },
  { value: 'Égypte', label: '🇪🇬 Égypte (Port-Saïd, Alexandrie, Damiette)', agpaoc: false },
  { value: 'Érythrée', label: '🇪🇷 Érythrée (Massawa, Assab)', agpaoc: false },
  { value: 'Kenya', label: '🇰🇪 Kenya (Mombasa)', agpaoc: false },
  { value: 'Libye', label: '🇱🇾 Libye (Tripoli, Benghazi, Misrata)', agpaoc: false },
  { value: 'Madagascar', label: '🇲🇬 Madagascar (Toamasina, Nosy Be)', agpaoc: false },
  { value: 'Maroc', label: '🇲🇦 Maroc (Tanger Med, Casablanca, Agadir)', agpaoc: false },
  { value: 'Maurice', label: '🇲🇺 Maurice (Port-Louis)', agpaoc: false },
  { value: 'Mozambique', label: '🇲🇿 Mozambique (Maputo, Beira, Nacala)', agpaoc: false },
  { value: 'Namibie', label: '🇳🇦 Namibie (Walvis Bay)', agpaoc: false },
  { value: 'Seychelles', label: '🇸🇨 Seychelles (Victoria)', agpaoc: false },
  { value: 'Somalie', label: '🇸🇴 Somalie (Mogadiscio, Berbera)', agpaoc: false },
  { value: 'Soudan', label: '🇸🇩 Soudan (Port-Soudan)', agpaoc: false },
  { value: 'Tanzanie', label: '🇹🇿 Tanzanie (Dar es Salaam, Zanzibar)', agpaoc: false },
  { value: 'Tunisie', label: '🇹🇳 Tunisie (Tunis-Radès, Sfax, Bizerte)', agpaoc: false },

  // Moyen-Orient avec ports
  { value: 'Arabie Saoudite', label: '🇸🇦 Arabie Saoudite (Jeddah, Dammam, King Abdullah)', agpaoc: false },
  { value: 'Bahreïn', label: '🇧🇭 Bahreïn (Khalifa Bin Salman)', agpaoc: false },
  { value: 'Émirats Arabes Unis', label: '🇦🇪 Émirats Arabes Unis (Jebel Ali / DP World)', agpaoc: false },
  { value: 'Irak', label: '🇮🇶 Irak (Bassora, Oum Qasr)', agpaoc: false },
  { value: 'Iran', label: '🇮🇷 Iran (Bandar Abbas, Shahid Rajaee)', agpaoc: false },
  { value: 'Koweït', label: '🇰🇼 Koweït (Shuwaikh, Shuaiba)', agpaoc: false },
  { value: 'Oman', label: '🇴🇲 Oman (Salalah, Sohar, Muscat)', agpaoc: false },
  { value: 'Qatar', label: '🇶🇦 Qatar (Hamad Port)', agpaoc: false },
  { value: 'Yémen', label: '🇾🇪 Yémen (Aden, Hodeidah)', agpaoc: false },

  // Asie avec grands ports
  { value: 'Bangladesh', label: '🇧🇩 Bangladesh (Chittagong)', agpaoc: false },
  { value: 'Chine', label: '🇨🇳 Chine (Shanghai, Shenzhen, Ningbo, Tianjin)', agpaoc: false },
  { value: 'Corée du Sud', label: '🇰🇷 Corée du Sud (Busan, Incheon)', agpaoc: false },
  { value: 'Inde', label: '🇮🇳 Inde (Mumbai, Chennai, JNPT, Mundra)', agpaoc: false },
  { value: 'Indonésie', label: '🇮🇩 Indonésie (Tanjung Priok / Jakarta)', agpaoc: false },
  { value: 'Japon', label: '🇯🇵 Japon (Tokyo, Yokohama, Kobe, Osaka)', agpaoc: false },
  { value: 'Malaisie', label: '🇲🇾 Malaisie (Port Klang, Tanjung Pelepas)', agpaoc: false },
  { value: 'Pakistan', label: '🇵🇰 Pakistan (Karachi, Gwadar)', agpaoc: false },
  { value: 'Philippines', label: '🇵🇭 Philippines (Manille, Cebu)', agpaoc: false },
  { value: 'Singapour', label: '🇸🇬 Singapour (Port of Singapore)', agpaoc: false },
  { value: 'Sri Lanka', label: '🇱🇰 Sri Lanka (Colombo)', agpaoc: false },
  { value: 'Thaïlande', label: '🇹🇭 Thaïlande (Laem Chabang, Bangkok)', agpaoc: false },
  { value: 'Vietnam', label: '🇻🇳 Vietnam (Ho Chi Minh, Haiphong)', agpaoc: false },

  // Europe avec grands ports
  { value: 'Allemagne', label: '🇩🇪 Allemagne (Hambourg, Brême)', agpaoc: false },
  { value: 'Belgique', label: '🇧🇪 Belgique (Anvers)', agpaoc: false },
  { value: 'Espagne', label: '🇪🇸 Espagne (Algésiras, Valence, Barcelone)', agpaoc: false },
  { value: 'France', label: '🇫🇷 France (Le Havre, Marseille, Dunkerque)', agpaoc: false },
  { value: 'Grèce', label: '🇬🇷 Grèce (Le Pirée, Thessalonique)', agpaoc: false },
  { value: 'Italie', label: '🇮🇹 Italie (Gênes, Trieste, La Spezia)', agpaoc: false },
  { value: 'Pays-Bas', label: '🇳🇱 Pays-Bas (Rotterdam)', agpaoc: false },
  { value: 'Portugal', label: '🇵🇹 Portugal (Sines, Lisbonne)', agpaoc: false },
  { value: 'Royaume-Uni', label: '🇬🇧 Royaume-Uni (Felixstowe, Southampton)', agpaoc: false },
  { value: 'Turquie', label: '🇹🇷 Turquie (Mersin, Ambarli, Izmir)', agpaoc: false },

  // Amériques avec ports
  { value: 'Brésil', label: '🇧🇷 Brésil (Santos, Paranaguá, Itajaí)', agpaoc: false },
  { value: 'Canada', label: '🇨🇦 Canada (Vancouver, Halifax, Montréal)', agpaoc: false },
  { value: 'Chili', label: '🇨🇱 Chili (Valparaíso, San Antonio)', agpaoc: false },
  { value: 'Colombie', label: '🇨🇴 Colombie (Cartagena, Buenaventura)', agpaoc: false },
  { value: 'États-Unis', label: '🇺🇸 États-Unis (Los Angeles, New York, Savannah, Houston)', agpaoc: false },
  { value: 'Mexique', label: '🇲🇽 Mexique (Manzanillo, Veracruz, Lazaro Cardenas)', agpaoc: false },
  { value: 'Panama', label: '🇵🇦 Panama (Balboa, Cristobal, Manzanillo Int.)', agpaoc: false },
  { value: 'Pérou', label: '🇵🇪 Pérou (Callao)', agpaoc: false },

  { value: 'Autre', label: 'Autre pays maritime', agpaoc: false },
]

const isAgpaoc = (pays) => PAYS_AGPAOC.some(p => p.toLowerCase() === pays.toLowerCase())

const CheckCircle = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="10" cy="10" r="8" />
    <polyline points="6.5 10 8.8 12.5 13.5 7.5" />
  </svg>
)

const BankIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const Inscription = () => {
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
  const [modal, setModal] = useState(null) // 'cgv' | 'rgpd' | 'annulation'

  const agpaocDetecte = form.pays && isAgpaoc(form.pays)
  const prixUnitaire = agpaocDetecte ? PRIX_AGPAOC : PRIX_STANDARD
  const nbParticipants = parseInt(form.participants) || 1
  const montantTotal = nbParticipants * prixUnitaire
  const economie = agpaocDetecte ? nbParticipants * (PRIX_STANDARD - PRIX_AGPAOC) : 0

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const generateDossier = () => {
    const rand = Math.floor(Math.random() * 90000) + 10000
    return `COPAF2026-${rand}`
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const dossier = generateDossier()

    const { error } = await supabase
      .from('inscriptions')
      .insert([{
        nom: form.nom, prenom: form.prenom, email: form.email,
        telephone: form.telephone, organisation: form.organisation,
        poste: form.poste, pays: form.pays,
        participants: nbParticipants,
        montant: montantTotal,
        tarif_agpaoc: agpaocDetecte,
        message: form.message,
        paiement_status: paiementMode === 'maintenant' ? 'en_attente' : 'reserve',
        dossier,
      }])

    if (error) {
      setLoading(false)
      setErrorMsg('Une erreur est survenue : ' + error.message)
      return
    }

    try {
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant: montantTotal, tarif_agpaoc: agpaocDetecte, dossier, paiement: paiementMode })
      })
    } catch (err) { console.log('Sheets:', err) }

    try {
      await emailjs.send('service_x07g4et', 'template_7wrkmm1', {
        prenom: form.prenom, nom: form.nom, email: form.email,
        organisation: form.organisation, poste: form.poste,
        pays: form.pays, participants: form.participants,
        montant: `${montantTotal.toLocaleString('fr-FR')} €`,
        tarif: agpaocDetecte ? `Tarif AGPAOC — ${PRIX_AGPAOC.toLocaleString('fr-FR')} €/pers.` : `Tarif standard — ${PRIX_STANDARD.toLocaleString('fr-FR')} €/pers.`,
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

  // Styles communs
  const inputBase = {
    width: '100%', padding: '12px 14px',
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: 10, color: '#1e293b',
    fontFamily: 'inherit', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  }
  const labelBase = {
    display: 'block', fontSize: 11.5, fontWeight: 700,
    letterSpacing: 1.2, textTransform: 'uppercase', color: '#64748b', marginBottom: 7,
  }
  const focusIn = e => {
    e.target.style.borderColor = '#0073f4'
    e.target.style.boxShadow = '0 0 0 3px rgba(0,115,244,0.1)'
  }
  const focusOut = e => {
    e.target.style.borderColor = '#E2E8F0'
    e.target.style.boxShadow = 'none'
  }

  return (
    <>
    <section id="inscription" style={{
      padding: 'clamp(70px, 10vw, 120px) clamp(20px, 5vw, 70px)',
      background: '#f0f4ff',
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      position: 'relative',
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0,115,244,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,14,145,0.05) 0%, transparent 50%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 70px)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.25)',
            borderRadius: 100, padding: '7px 20px', marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0073f4' }} />
            <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
              Rejoindre la COPAF 2026
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4.5vw, 50px)', fontWeight: 800,
            color: '#000e91', marginBottom: 16, lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Inscription &{' '}
            <span style={{ color: '#0073f4' }}>Paiement</span>
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)', color: '#64748b',
            maxWidth: 540, margin: '0 auto', lineHeight: 1.8,
          }}>
            Réservez votre place dès maintenant. Paiement sécurisé par virement bancaire.
          </p>
        </div>

        {/* GRID LAYOUT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'clamp(20px, 4vw, 40px)', alignItems: 'start',
        }}>

          {/* ========= FORMULAIRE ========= */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,115,244,0.1)',
            borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)',
            boxShadow: '0 8px 48px rgba(0,14,145,0.08)',
          }}>

            {submitted ? (
              /* ── SUCCESS STATE ── */
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0073f4, #000e91)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: '#000e91', marginBottom: 8 }}>
                  {paiementMode === 'maintenant' ? 'Inscription confirmée !' : 'Place réservée !'}
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.7 }}>
                  Merci <strong style={{ color: '#000e91' }}>{form.prenom} {form.nom}</strong>.<br />
                  {paiementMode === 'maintenant'
                    ? <>Vous recevrez les instructions de virement à <strong style={{ color: '#0073f4' }}>{form.email}</strong> sous 24h.</>
                    : <>Votre place est réservée. Réglez avant le <strong style={{ color: '#0073f4' }}>1er Août 2026</strong>.</>
                  }
                </p>

                {/* Numéro de dossier */}
                <div style={{
                  background: 'linear-gradient(135deg, #000e91, #0073f4)',
                  borderRadius: 14, padding: '18px 28px', marginBottom: 24, display: 'inline-block',
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Numéro de dossier
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', letterSpacing: 2 }}>
                    {dossierNum}
                  </div>
                </div>

                {/* Récap montant */}
                <div style={{
                  background: '#f0f4ff', border: '1px solid rgba(0,115,244,0.15)',
                  borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left',
                }}>
                  <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                    Récapitulatif
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', paddingBottom: 8, borderBottom: '1px solid rgba(0,115,244,0.1)', marginBottom: 8 }}>
                    <span>Participants</span><strong style={{ color: '#0f172a' }}>{form.participants}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', paddingBottom: 8, borderBottom: '1px solid rgba(0,115,244,0.1)', marginBottom: 8 }}>
                    <span>Tarif unitaire</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: '#0f172a' }}>{prixUnitaire.toLocaleString('fr-FR')} €</strong>
                      {agpaocDetecte && <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>AGPAOC</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#000e91' }}>
                    <span>Total</span><span>{montantTotal.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>

                {/* Étapes */}
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
                      display: 'flex', gap: 10, alignItems: 'center', padding: '9px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                      fontSize: 13.5, color: '#475569',
                    }}>
                      <span style={{ color: '#0073f4', flexShrink: 0 }}><CheckCircle /></span>
                      {step}
                    </div>
                  ))}
                </div>

                {paiementMode === 'plus_tard' && (
                  <div style={{
                    background: '#fffbeb', border: '1px solid #fbbf24',
                    borderRadius: 10, padding: '13px 16px', marginTop: 20,
                    fontSize: 13, color: '#92400e', textAlign: 'left', lineHeight: 1.6,
                  }}>
                    ⚠️ Votre place est réservée mais <strong>non confirmée</strong> jusqu'au paiement. Sans règlement avant le 1er Août 2026, votre réservation sera annulée.
                  </div>
                )}
              </div>

            ) : (
              /* ── FORM ── */
              <form onSubmit={handleSubmit}>
                <h3 style={{
                  fontSize: 20, fontWeight: 800, color: '#000e91',
                  marginBottom: 28, textAlign: 'center', letterSpacing: '-0.02em',
                }}>
                  Formulaire d'inscription
                </h3>

                {/* Nom / Prénom */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelBase}>Nom *</label>
                    <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={labelBase}>Prénom *</label>
                    <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Votre prénom"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                {/* Email / Téléphone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelBase}>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="votre@email.com"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={labelBase}>Téléphone *</label>
                    <input name="telephone" value={form.telephone} onChange={handleChange} required placeholder="+229 01 XX XX XX"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                {/* Organisation / Poste */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelBase}>Organisation *</label>
                    <input name="organisation" value={form.organisation} onChange={handleChange} required placeholder="Port / Entreprise"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <div>
                    <label style={labelBase}>Poste *</label>
                    <input name="poste" value={form.poste} onChange={handleChange} required placeholder="Votre fonction"
                      style={inputBase} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                {/* Pays / Participants */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelBase}>Pays *</label>
                    <select name="pays" value={form.pays} onChange={handleChange} required
                      style={{ ...inputBase, cursor: 'pointer', color: form.pays ? '#1e293b' : '#94a3b8' }}
                      onFocus={focusIn} onBlur={focusOut}
                    >
                      <option value="" disabled>Sélectionnez votre pays</option>
                      <option value="" disabled style={{ color: '#94a3b8', fontStyle: 'italic' }}>── Pays membres AGPAOC ──</option>
                      {TOUS_LES_PAYS.filter(p => p.agpaoc).map(p => (
                        <option key={p.value} value={p.value}>{p.label} ★</option>
                      ))}
                      <option value="" disabled>── Autres pays ──</option>
                      {TOUS_LES_PAYS.filter(p => !p.agpaoc && !p.disabled).map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>

                    {/* Badge AGPAOC détecté */}
                    {agpaocDetecte && (
                      <div style={{
                        marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                        background: '#dcfce7', border: '1px solid #bbf7d0',
                        borderRadius: 8, padding: '6px 12px',
                      }}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                          <polyline points="2 8 6 12 14 4" />
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                          Tarif AGPAOC appliqué — {PRIX_AGPAOC.toLocaleString('fr-FR')} €/pers.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelBase}>Participants</label>
                    <select name="participants" value={form.participants} onChange={handleChange}
                      style={{ ...inputBase, cursor: 'pointer' }}
                      onFocus={focusIn} onBlur={focusOut}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={n}>
                          {n} participant{n > 1 ? 's' : ''} — {(n * prixUnitaire).toLocaleString('fr-FR')} €
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 22 }}>
                  <label style={labelBase}>Message / Besoins spécifiques</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    placeholder="Questions, besoins alimentaires, accessibilité..." rows={3}
                    style={{ ...inputBase, resize: 'vertical' }}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Mode paiement */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelBase}>Mode de paiement *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      {
                        value: 'maintenant',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                            <rect x="1" y="4" width="22" height="16" rx="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        ),
                        title: 'Payer maintenant',
                        desc: 'Virement sous 7 jours',
                      },
                      {
                        value: 'plus_tard',
                        icon: (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        ),
                        title: 'Réserver ma place',
                        desc: 'Payer avant le 1er Août',
                      },
                    ].map(opt => (
                      <div key={opt.value}
                        onClick={() => setPaiementMode(opt.value)}
                        style={{
                          border: `2px solid ${paiementMode === opt.value ? '#0073f4' : '#E2E8F0'}`,
                          borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                          background: paiementMode === opt.value ? '#EEF4FF' : '#FAFAFA',
                          transition: 'all 0.2s', textAlign: 'center',
                        }}
                      >
                        <div style={{ color: paiementMode === opt.value ? '#0073f4' : '#94a3b8', marginBottom: 6 }}>
                          {opt.icon}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: paiementMode === opt.value ? '#0073f4' : '#334155', marginBottom: 3 }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total récap */}
                <div style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      {nbParticipants} × {prixUnitaire.toLocaleString('fr-FR')} €
                      {agpaocDetecte && <span style={{ marginLeft: 8, fontSize: 11, background: '#dcfce7', color: '#166534', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>AGPAOC</span>}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#000e91' }}>
                      {montantTotal.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  {agpaocDetecte && economie > 0 && (
                    <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      ✓ Économie AGPAOC : {economie.toLocaleString('fr-FR')} € par rapport au tarif standard
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 18,
                    fontSize: 13, color: '#dc2626',
                  }}>
                    ✕ {errorMsg}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0073f4 0%, #0052cc 100%)',
                  color: '#FFFFFF', border: 'none', padding: '16px',
                  borderRadius: 12, fontFamily: 'inherit', fontWeight: 800,
                  fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(0,115,244,0.35)',
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {loading ? 'Envoi en cours…' : paiementMode === 'maintenant' ? 'Confirmer & Payer' : 'Réserver ma place'}
                </button>

                {/* Avertissement paiement - no-refund */}
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 18,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.65 }}>
                    <strong>Aucun remboursement ne sera effectué.</strong> Avant tout paiement, veuillez nous contacter pour confirmer votre participation :{' '}
                    <a href="https://wa.me/2290169024349" target="_blank" rel="noreferrer"
                      style={{ color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>
                      WhatsApp
                    </a>
                    {' '}ou{' '}
                    <a href="mailto:contact@crfperfection.pro"
                      style={{ color: '#0073f4', fontWeight: 700, textDecoration: 'none' }}>
                      contact@crfperfection.pro
                    </a>
                  </div>
                </div>

                {/* Checkboxes CGV + RGPD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    {
                      id: 'cgv', checked: cgvAccepted, onChange: () => setCgvAccepted(!cgvAccepted),
                      label: <>J'ai lu et j'accepte les{' '}
                        <button type="button" onClick={() => setModal('cgv')}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#0073f4', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>
                          Conditions Générales de Vente
                        </button>
                      </>
                    },
                    {
                      id: 'rgpd', checked: rgpdAccepted, onChange: () => setRgpdAccepted(!rgpdAccepted),
                      label: <>J'accepte la{' '}
                        <button type="button" onClick={() => setModal('rgpd')}
                          style={{ background: 'none', border: 'none', padding: 0, color: '#0073f4', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', textDecoration: 'underline' }}>
                          Politique de confidentialité (RGPD)
                        </button>
                      </>
                    },
                  ].map(item => (
                    <label key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input type="checkbox" checked={item.checked} onChange={item.onChange} required
                        style={{ marginTop: 3, width: 16, height: 16, accentColor: '#0073f4', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{item.label}</span>
                    </label>
                  ))}
                  <div style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 26 }}>
                    <button type="button" onClick={() => setModal('annulation')}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                      Politique d'annulation
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ========= SIDEBAR ========= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 3vw, 20px)' }}>

            {/* Tarifs */}
            <div style={{ background: '#000e91', borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', boxShadow: '0 12px 48px rgba(0,14,145,0.25)' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 16 }}>
                  Tarification
                </div>

                {/* Tarif Standard */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                    Tarif Standard
                  </div>
                  <div style={{ fontSize: 'clamp(38px, 6vw, 48px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                    5 000 <span style={{ fontSize: 22 }}>€</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>par participant</div>
                </div>

                {/* Tarif AGPAOC */}
                <div style={{
                  background: 'rgba(0,115,244,0.2)', border: '1px solid rgba(0,115,244,0.4)',
                  borderRadius: 14, padding: '14px 20px',
                }}>
                  <div style={{ fontSize: 10, color: '#7ab8ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
                    Tarif membres AGPAOC ★
                  </div>
                  <div style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                    4 500 <span style={{ fontSize: 18 }}>€</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#7ab8ff', marginTop: 4 }}>économisez 500 € / pers.</div>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />

              {[
                'Frais de participation à la conférence (3 jours)',
                'Pauses-café & déjeuners',
                'Matériels didactiques',
                'Tablette préchargée',
                '2 Certifications internationales',
                'Transferts aéroport ↔ hôtel',
              ].map((item, i, arr) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  fontSize: 13.5, color: 'rgba(255,255,255,0.8)',
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(0,115,244,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: '#fff',
                  }}>
                    <CheckCircle />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            {/* Virement bancaire */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #e2e8f0',
              borderRadius: 20, padding: 'clamp(20px, 3.5vw, 28px)',
              boxShadow: '0 4px 20px rgba(0,14,145,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
                <span style={{ color: '#0073f4' }}><BankIcon /></span>
                <span style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
                  Paiement par Virement
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 16, textAlign: 'center' }}>
                Après validation, vous recevrez par email les coordonnées bancaires complètes.
              </p>
              {[
                { label: 'Bénéficiaire', value: 'CRF PERFECTION' },
                { label: 'Référence', value: 'COPAF2026 + Nom' },
                { label: 'Délai paiement', value: '7 jours ouvrés' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 8, flexWrap: 'wrap', padding: '10px 0',
                  borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#000e91' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #e2e8f0',
              borderRadius: 20, padding: 'clamp(20px, 3.5vw, 28px)',
              boxShadow: '0 4px 20px rgba(0,14,145,0.05)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000e91', marginBottom: 16, textAlign: 'center' }}>
                Besoin d'aide ?
              </div>
              {[
                { icon: <PhoneIcon />, value: '+229 01 69 30 30 19' },
                { icon: <PhoneIcon />, value: '+1 (240) 978-4155' },
                { icon: <MailIcon />, value: 'contact@crfperfection.pro' },
                { icon: <GlobeIcon />, value: 'www.crfperfection.pro' },
              ].map((c, i) => (
                <div key={i} style={{
                  fontSize: 13, color: '#475569', padding: '8px 0',
                  display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
                  borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', wordBreak: 'break-word',
                }}>
                  <span style={{ color: '#0073f4', flexShrink: 0 }}>{c.icon}</span>
                  {c.value}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>

      {/* ========= MODALS ========= */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 20,
              padding: 'clamp(28px, 5vw, 44px)',
              maxWidth: 580, width: '100%',
              maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            }}
          >
            {/* Header modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10, color: '#0073f4', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 6 }}>
                  {modal === 'cgv' ? 'Conditions Générales de Vente' : modal === 'rgpd' ? 'Confidentialité & RGPD' : "Politique d'annulation"}
                </div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: '#000e91', margin: 0 }}>
                  {modal === 'cgv' ? 'CGV — COPAF 2026' : modal === 'rgpd' ? 'Vos données personnelles' : 'Annulation & Remboursement'}
                </h4>
              </div>
              <button onClick={() => setModal(null)} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 8,
                width: 32, height: 32, cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>✕</button>
            </div>

            <div style={{ height: 1, background: '#e2e8f0', marginBottom: 24 }} />

            {/* Contenu CGV */}
            {modal === 'cgv' && (
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                {[
                  { titre: '1. Objet', texte: "Les présentes conditions régissent les inscriptions à la Conférence des Ports d'Afrique (COPAF 2026), organisée par CRF Perfection. Toute inscription vaut acceptation pleine et entière des présentes CGV." },
                  { titre: '2. Prix et tarification', texte: `Le tarif standard est de ${PRIX_STANDARD.toLocaleString('fr-FR')} € par participant. Les membres des ports affiliés à l'AGPAOC bénéficient d'un tarif préférentiel de ${PRIX_AGPAOC.toLocaleString('fr-FR')} € par participant, sous réserve de vérification de l'appartenance à l'organisation.` },
                  { titre: '3. Modalités de paiement', texte: "Le paiement s'effectue exclusivement par virement bancaire. Les coordonnées bancaires complètes sont transmises par email dans les 24h suivant la validation de l'inscription. Le règlement doit intervenir dans les 7 jours ouvrés suivant la réception des instructions." },
                  { titre: '4. Confirmation de participation', texte: "La participation ne sera définitivement confirmée qu'après réception du paiement intégral. Un badge nominatif et les informations logistiques seront transmis après confirmation du virement." },
                  { titre: '5. Responsabilité', texte: "CRF Perfection se réserve le droit de modifier le programme, les intervenants ou le lieu sans préavis. En cas d'annulation de l'événement par l'organisateur, les participants seront informés et une solution alternative sera proposée." },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, color: '#000e91', marginBottom: 6 }}>{s.titre}</div>
                    <p style={{ margin: 0 }}>{s.texte}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Contenu RGPD */}
            {modal === 'rgpd' && (
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                {[
                  { titre: 'Responsable du traitement', texte: 'CRF Perfection — contact@crfperfection.pro — www.crfperfection.pro' },
                  { titre: 'Données collectées', texte: 'Nom, prénom, email, téléphone, organisation, poste, pays. Ces données sont strictement nécessaires à la gestion de votre inscription.' },
                  { titre: 'Finalité', texte: "Vos données sont utilisées exclusivement dans le cadre de la COPAF 2026 : gestion administrative, envoi des confirmations et informations logistiques, et suivi de votre dossier de paiement." },
                  { titre: 'Conservation', texte: 'Vos données sont conservées pendant 3 ans à compter de la conférence, conformément aux obligations légales comptables et contractuelles.' },
                  { titre: 'Partage', texte: "Vos données ne sont pas vendues ni cédées à des tiers. Elles peuvent être partagées avec nos prestataires techniques (hébergement, email) dans le strict cadre de l'exécution du service." },
                  { titre: 'Vos droits', texte: "Vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Pour exercer ces droits : contact@crfperfection.pro" },
                ].map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, color: '#000e91', marginBottom: 6 }}>{s.titre}</div>
                    <p style={{ margin: 0 }}>{s.texte}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Contenu Annulation */}
            {modal === 'annulation' && (
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 12, padding: '16px 18px', marginBottom: 24,
                }}>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Politique de non-remboursement
                  </div>
                  <p style={{ margin: 0, color: '#7f1d1d' }}>
                    Toute inscription confirmée (après paiement) est définitive. <strong>Aucun remboursement ne sera accordé</strong>, quelle que soit la raison invoquée.
                  </p>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontWeight: 700, color: '#000e91', marginBottom: 6 }}>Avant de payer — contactez-nous</div>
                  <p style={{ margin: '0 0 14px' }}>
                    Nous vous encourageons vivement à nous contacter <strong>avant tout paiement</strong> pour confirmer votre disponibilité et valider les détails logistiques.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <a href="https://wa.me/2290169024349" target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: 10, padding: '12px 16px', textDecoration: 'none',
                    }}>
                      <span style={{ fontSize: 20, color: '#15803d', fontWeight: 800, lineHeight: 1 }}>WA</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>WhatsApp</div>
                        <div style={{ color: '#166534', fontSize: 13 }}>+229 01 69 02 43 49</div>
                      </div>
                    </a>
                    <a href="mailto:contact@crfperfection.pro" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: 10, padding: '12px 16px', textDecoration: 'none',
                    }}>
                      <span style={{ fontSize: 18, color: '#1d4ed8', fontWeight: 800 }}>@</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>Email</div>
                        <div style={{ color: '#1e40af', fontSize: 13 }}>contact@crfperfection.pro</div>
                      </div>
                    </a>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: '#000e91', marginBottom: 6 }}>Transfert de participation</div>
                  <p style={{ margin: 0 }}>
                    En cas d'empêchement, vous pouvez transférer votre inscription à un collègue de la même organisation, sous réserve de notification écrite à <strong>contact@crfperfection.pro</strong> au moins 7 jours avant l'événement.
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <button onClick={() => setModal(null)} style={{
                background: 'linear-gradient(135deg, #0073f4, #0052cc)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '12px 32px', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', letterSpacing: 0.5,
              }}>
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Inscription