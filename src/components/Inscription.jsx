import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import ReactGA from 'react-ga4'
import emailjs from '@emailjs/browser'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLClkSCepqlUnoshI8D01U_G4'
const PRIX_PARTICIPANT = 3500

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

// ── TYPES D'INSCRIPTION — 3 cartes ──────────────────────────────────────────

const TYPES_INSCRIPTION = [
  {
    id: 'participant',
    emoji: '🎫',
    label: 'Participant',
    sublabel: 'Je participe à la conférence',
    desc: 'Ports, autorités portuaires, entreprises paraportuaires, logisticiens, shippers et tout professionnel du maritime.',
    prix: '3 500 €',
    tag: 'par personne',
    cta: "S'inscrire comme participant",
    color: '#0073f4',
    redirect: false,
  },
  {
    id: 'sponsor',
    emoji: '💎',
    label: 'Sponsor / Partenaire',
    sublabel: 'Visibilité & partenariat institutionnel',
    desc: 'Sponsors Platine, Or, Argent, Bronze — ou partenariat institutionnel, média, académique. Construisez votre package sur-mesure.',
    prix: 'Dès 8 000 €',
    tag: 'sponsors & partenaires stratégiques',
    cta: 'Voir les offres',
    color: '#FFD700',
    redirect: true,
    redirectTo: '/partenariats',
  },
  {
    id: 'exposant',
    emoji: '🖥️',
    label: 'Exposant',
    sublabel: 'Vitrine digitale de vos solutions',
    desc: 'Exposition 100% digitale sur le site COPAF et les tablettes distribuées aux participants. 3 formules à partir de 500 €.',
    prix: 'Dès 500 €',
    tag: 'digital · site + tablettes',
    cta: 'Voir les formules exposant',
    color: '#a78bfa',
    redirect: true,
    redirectTo: '/exposants',
  },
]

// ── ICÔNES ───────────────────────────────────────────────────────────────────

const CheckCircle = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <circle cx="10" cy="10" r="8" />
    <polyline points="6.5 10 8.8 12.5 13.5 7.5" />
  </svg>
)

const ArrowRight = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="4" y1="10" x2="16" y2="10" />
    <polyline points="11 5 16 10 11 15" />
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

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

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
  const [modal, setModal] = useState(null)

  const nbParticipants = parseInt(form.participants) || 1
  const montantTotal = nbParticipants * PRIX_PARTICIPANT

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleTypeSelect = (type) => {
    setTypeChoisi(type)
    if (type.redirect) {
      navigate(type.redirectTo)
    } else {
      setEtape(2)
    }
  }

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
        tarif_agpaoc: false,
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
        position: 'relative', minHeight: '100vh',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0,115,244,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,14,145,0.05) 0%, transparent 50%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto' }}>

          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
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
              {etape === 1
                ? <>Choisissez votre <span style={{ color: '#0073f4' }}>type de participation</span></>
                : <>Inscription <span style={{ color: '#0073f4' }}>Participant</span></>
              }
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 17px)', color: '#64748b',
              maxWidth: 560, margin: '0 auto', lineHeight: 1.8,
            }}>
              {etape === 1
                ? 'Sélectionnez la catégorie qui correspond à votre profil pour accéder au bon formulaire.'
                : 'Remplissez le formulaire ci-dessous. Paiement sécurisé par virement bancaire.'
              }
            </p>

            {etape === 2 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24 }}>
                <button onClick={() => setEtape(1)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: '#0073f4', fontSize: 13, fontWeight: 600,
                  padding: '6px 14px', borderRadius: 8, transition: 'background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,115,244,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <line x1="16" y1="10" x2="4" y2="10" /><polyline points="9 15 4 10 9 5" />
                  </svg>
                  Changer de catégorie
                </button>
                <span style={{ color: '#cbd5e1', fontSize: 12 }}>·</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Participant · 3 500 € / personne</span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              ÉTAPE 1 — SÉLECTION DU TYPE (3 cartes)
          ══════════════════════════════════════════════ */}
          {etape === 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'clamp(14px, 2.5vw, 22px)',
              maxWidth: 960, margin: '0 auto',
            }}>
              {TYPES_INSCRIPTION.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    background: '#FFFFFF',
                    border: `2px solid ${type.color}22`,
                    borderRadius: 20,
                    padding: 'clamp(24px, 4vw, 36px)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 4px 24px rgba(0,14,145,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 0,
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = `0 16px 48px ${type.color}22`
                    e.currentTarget.style.borderColor = type.color
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,14,145,0.06)'
                    e.currentTarget.style.borderColor = `${type.color}22`
                  }}
                >
                  {/* Accent top bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: type.color, borderRadius: '20px 20px 0 0',
                  }} />

                  {/* Emoji */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${type.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, marginBottom: 18, marginTop: 8,
                  }}>
                    {type.emoji}
                  </div>

                  <div style={{ fontSize: 20, fontWeight: 800, color: '#000e91', marginBottom: 4, letterSpacing: '-0.02em' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: type.color, marginBottom: 14, letterSpacing: 0.5 }}>
                    {type.sublabel}
                  </div>

                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 22, flexGrow: 1 }}>
                    {type.desc}
                  </p>

                  <div style={{
                    background: `${type.color}0d`,
                    border: `1px solid ${type.color}22`,
                    borderRadius: 10, padding: '10px 14px',
                    marginBottom: 18,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{type.prix}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{type.tag}</span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: type.color,
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    <span>{type.cta}</span>
                    <ArrowRight />
                  </div>

                  {type.redirect && (
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'rgba(100,116,139,0.1)',
                      border: '1px solid rgba(100,116,139,0.15)',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      Page dédiée →
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════
              ÉTAPE 2 — FORMULAIRE PARTICIPANT
          ══════════════════════════════════════════════ */}
          {etape === 2 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: 'clamp(20px, 4vw, 40px)', alignItems: 'start',
            }}>

              {/* ── FORMULAIRE ── */}
              <div style={{
                background: '#FFFFFF', border: '1px solid rgba(0,115,244,0.1)',
                borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)',
                boxShadow: '0 8px 48px rgba(0,14,145,0.08)',
              }}>

                {submitted ? (
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
                        <strong style={{ color: '#0f172a' }}>{PRIX_PARTICIPANT.toLocaleString('fr-FR')} €</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#000e91' }}>
                        <span>Total</span><span>{montantTotal.toLocaleString('fr-FR')} €</span>
                      </div>
                    </div>

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
                  <form onSubmit={handleSubmit}>
                    <h3 style={{
                      fontSize: 20, fontWeight: 800, color: '#000e91',
                      marginBottom: 28, textAlign: 'center', letterSpacing: '-0.02em',
                    }}>
                      Formulaire d'inscription
                    </h3>

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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={labelBase}>Pays *</label>
                        <select name="pays" value={form.pays} onChange={handleChange} required
                          style={{ ...inputBase, cursor: 'pointer', color: form.pays ? '#1e293b' : '#94a3b8' }}
                          onFocus={focusIn} onBlur={focusOut}
                        >
                          <option value="" disabled>Sélectionnez votre pays</option>
                          {TOUS_LES_PAYS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelBase}>Participants</label>
                        <select name="participants" value={form.participants} onChange={handleChange}
                          style={{ ...inputBase, cursor: 'pointer' }}
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

                    <div style={{ marginBottom: 22 }}>
                      <label style={labelBase}>Message / Besoins spécifiques</label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Questions, besoins alimentaires, accessibilité..." rows={3}
                        style={{ ...inputBase, resize: 'vertical' }}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>

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

                    <div style={{
                      background: '#f8fafc', border: '1.5px solid #e2e8f0',
                      borderRadius: 12, padding: '14px 18px', marginBottom: 20,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                          {nbParticipants} × {PRIX_PARTICIPANT.toLocaleString('fr-FR')} €
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#000e91' }}>
                          {montantTotal.toLocaleString('fr-FR')} €
                        </span>
                      </div>
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
                        <strong>Aucun remboursement ne sera effectué.</strong> Contactez-nous avant tout paiement :{' '}
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
                  </form>
                )}
              </div>

              {/* ── SIDEBAR ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 3vw, 20px)' }}>

                <div style={{ background: '#000e91', borderRadius: 20, padding: 'clamp(24px, 4vw, 36px)', boxShadow: '0 12px 48px rgba(0,14,145,0.25)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 16 }}>
                      Tarif Participant
                    </div>
                    <div style={{ fontSize: 'clamp(38px, 6vw, 48px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                      3 500 <span style={{ fontSize: 22 }}>€</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>par participant · tarif unique</div>
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

                {/* Liens vers autres catégories */}
                <div style={{
                  background: '#FFFFFF', border: '1px solid #e2e8f0',
                  borderRadius: 20, padding: 'clamp(20px, 3.5vw, 28px)',
                  boxShadow: '0 4px 20px rgba(0,14,145,0.05)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
                    Autres catégories
                  </div>
                  {TYPES_INSCRIPTION.filter(t => t.redirect).map((type, i, arr) => (
                    <div key={type.id}
                      onClick={() => navigate(type.redirectTo)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 0', cursor: 'pointer',
                        borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#0073f4'}
                      onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span>{type.emoji}</span> {type.label}
                      </span>
                      <span style={{ fontSize: 12, color: '#0073f4' }}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODALS */}
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

            {modal === 'cgv' && (
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                {[
                  { titre: '1. Objet', texte: "Les présentes conditions régissent les inscriptions à la Conférence des Ports d'Afrique (COPAF 2026), organisée par CRF Perfection. Toute inscription vaut acceptation pleine et entière des présentes CGV." },
                  { titre: '2. Prix et tarification', texte: `Le tarif participant est de ${PRIX_PARTICIPANT.toLocaleString('fr-FR')} € par participant, sans distinction de pays ou d'organisation.` },
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

            {modal === 'annulation' && (
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 12, padding: '16px 18px', marginBottom: 24,
                }}>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 15, marginBottom: 6 }}>
                    Politique de non-remboursement
                  </div>
                  <p style={{ margin: 0, color: '#7f1d1d' }}>
                    Toute inscription confirmée (après paiement) est définitive. <strong>Aucun remboursement ne sera accordé</strong>, quelle que soit la raison invoquée.
                  </p>
                </div>
                <div style={{ marginBottom: 18 }}>
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
                cursor: 'pointer',
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