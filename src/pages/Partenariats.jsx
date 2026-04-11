import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── DONNÉES ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'sponsor', label: 'Sponsors Catalogue', emoji: '💎', desc: 'Offre standardisée, tarifs fixes' },
  { id: 'strategique', label: 'Partenaires Stratégiques', emoji: '🏛️', desc: 'Ports & institutions, tarifs fixes' },
]

const SPONSORS = [
  {
    id: 'platine', label: 'Platine', price: '20 000 €', color: '#7c5cbf', accent: 'rgba(124,92,191,0.07)', badge: '👑 Niveau supérieur',
    avantages: [
      'Être membre de COPAF et bénéficier des conférences COPAF à travers le monde',
      'Logo du partenaire officiel sur le site de la conférence',
      'Certificat de partenariat décerné à la fin de la conférence',
      'Quatre (04) tickets de participation inclus',
      'Possibilité de mettre son branding sur les supports',
      'Une page de parution dans le magazine de Recap COPAF',
      'Deux publicités digitales dans la newsletter COPAF',
      "Une assistance ultérieure dans le domaine de l'intelligence artificielle",
      'Un exposé de 15 minutes pendant la conférence',
      'Distribution de prospectus',
    ],
  },
  {
    id: 'or', label: 'Or', price: '16 000 €', color: '#c49a00', accent: 'rgba(196,154,0,0.07)', badge: '⭐ Très populaire',
    avantages: [
      'Être membre de COPAF et bénéficier des conférences COPAF à travers le monde',
      'Logo du sponsor sur le site de la conférence',
      'Certificat de partenariat décerné à la fin de la conférence',
      'Trois (03) tickets de participation inclus',
      'Possibilité de mettre son branding sur les supports',
      'Une demi-page de parution dans le magazine de Recap COPAF',
      'Une publicité digitale dans la newsletter COPAF',
      'Un exposé de 10 minutes pendant la conférence',
      'Distribution de prospectus',
    ],
  },
  {
    id: 'argent', label: 'Argent', price: '10 000 €', color: '#6b7c99', accent: 'rgba(107,124,153,0.07)',
    avantages: [
      'Être membre de COPAF et bénéficier des conférences COPAF à travers le monde',
      'Logo du sponsor sur le site de la conférence',
      'Certificat de partenariat décerné à la fin de la conférence',
      'Deux (02) tickets de participation inclus',
      'Possibilité de mettre son branding sur les supports',
      'Un quart de page de parution dans le magazine de Recap COPAF',
      'Logo & nom de la société cités dans la newsletter COPAF',
      'Un exposé de 5 minutes pendant la conférence',
    ],
  },
  {
    id: 'bronze', label: 'Bronze', price: '8 000 €', color: '#b06020', accent: 'rgba(176,96,32,0.07)',
    avantages: [
      'Être membre de COPAF et bénéficier des conférences COPAF à travers le monde',
      "Logo de l'entreprise sur le site de la conférence",
      'Certificat de partenariat décerné à la fin de la conférence',
      'Un (01) ticket de participation inclus',
      'Possibilité de mettre son branding sur les supports',
      'Parution de logo dans le magazine de Recap COPAF',
      'Logo de la société dans la newsletter COPAF',
    ],
  },
]

const PARTENAIRES_STRATEGIQUES = [
  {
    id: 'pso', label: 'Partenaire Stratégique Officiel', short: 'PSO',
    price: '30 000 €', color: '#000E91', accent: 'rgba(0,14,145,0.07)', badge: '🌟 Niveau premium',
    desc: "Le niveau d'engagement le plus élevé. Vous co-portez l'événement avec COPAF.",
    avantages: [
      "Membre officiel du comité d'organisation COPAF 2026",
      'Logo en position #1 — premium sur tous les supports officiels',
      'Co-branding "COPAF × Votre organisation" sur tous les visuels',
      'Tribune officielle — prise de parole plénière de 20 minutes',
      'Six (06) badges participants inclus',
      'Page dédiée premium sur le site COPAF',
      'Contenu prioritaire sur les tablettes distribuées aux participants',
      'Certificat de Partenariat Stratégique Officiel',
      'Mention "Partenaire Stratégique Officiel" sur tous les supports',
      'Accès complet aux données et résultats de la conférence',
      'Partenariat reconductible pour les éditions futures COPAF',
    ],
  },
  {
    id: 'ps', label: 'Partenaire Stratégique', short: 'PS',
    price: '20 000 €', color: '#0073F4', accent: 'rgba(0,115,244,0.07)', badge: '🤝 Partenariat associé',
    desc: "S'associer officiellement à la COPAF 2026 avec une forte visibilité.",
    avantages: [
      'Logo sur tous les supports officiels de la conférence',
      'Mention "Partenaire Stratégique" sur tous les supports',
      'Prise de parole officielle — 10 minutes',
      'Trois (03) badges participants inclus',
      'Fiche dédiée sur le site COPAF',
      'Contenu sur les tablettes distribuées aux participants',
      'Certificat de Partenariat Stratégique',
      'Accès aux actes officiels de la conférence',
    ],
  },
]

// ─── SOUS-COMPOSANTS ────────────────────────────────────────────────────────

const CheckIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.15" />
    <polyline points="3.5 7 5.5 9.5 10.5 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ErrorBlock = ({ msg }) => (
  <div style={{
    background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
    borderRadius: 10, padding: '12px 16px', marginBottom: 18,
    fontSize: 13, color: '#cc2222',
    wordBreak: 'break-word', overflowWrap: 'break-word',
  }}>
    ✕ {msg}
  </div>
)

const SubmitButton = ({ loading, label, colorA = '#000E91', colorB = '#0073F4' }) => (
  <button
    type="submit"
    disabled={loading}
    style={{
      width: '100%',
      padding: '16px',
      background: loading ? '#e5e7eb' : `linear-gradient(135deg, ${colorA} 0%, ${colorB} 100%)`,
      color: loading ? '#9ca3af' : '#FFFFFF',
      border: 'none', borderRadius: 12, fontFamily: 'inherit',
      fontWeight: 800, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase',
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: loading ? 'none' : `0 8px 28px rgba(0,115,244,0.28)`,
      transition: 'all 0.2s',
      boxSizing: 'border-box',
      /* Zone de tap suffisante sur mobile */
      minHeight: 52,
      /* Empêche le texte long de déborder */
      overflow: 'hidden',
      wordBreak: 'break-word',
    }}
  >
    {loading ? '⏳ Envoi en cours…' : label}
  </button>
)

const SuccessBlock = ({ contact }) => (
  <div style={{ textAlign: 'center', padding: '32px 0' }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: 'linear-gradient(135deg, #000E91, #0073F4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px', fontSize: 32, color: '#fff',
      flexShrink: 0,
    }}>✓</div>
    <h3 style={{
      fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 900,
      color: '#000E91', marginBottom: 10,
      wordBreak: 'break-word',
    }}>
      Demande enregistrée !
    </h3>
    <p style={{
      color: '#6b7280', fontSize: 14, lineHeight: 1.8, marginBottom: 28,
      wordBreak: 'break-word', overflowWrap: 'break-word',
    }}>
      Merci <strong style={{ color: '#111827' }}>{contact}</strong>.<br />
      Notre équipe vous contactera dans les <strong style={{ color: '#0073F4' }}>48h</strong> pour finaliser votre partenariat.
    </p>
    <div style={{
      background: 'rgba(0,115,244,0.05)',
      border: '1px solid rgba(0,115,244,0.15)',
      borderRadius: 12, padding: '20px 24px', textAlign: 'left',
    }}>
      {[
        '📧 Email de confirmation envoyé',
        '📞 Appel de présentation planifié',
        '📄 Dossier de partenariat envoyé',
        '✍️ Contrat préparé selon votre choix',
      ].map((s, i) => (
        <div key={i} style={{
          padding: '8px 0', fontSize: 13.5, color: '#374151',
          borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          wordBreak: 'break-word',
        }}>
          {s}
        </div>
      ))}
    </div>
  </div>
)

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

const Partenariats = () => {
  const location = useLocation()

  const getInitialSection = () => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type')
    return type === 'strategique' ? 'strategique' : 'sponsor'
  }

  const [activeSection, setActiveSection] = useState(getInitialSection)
  const [selectedOption, setSelectedOption] = useState(null)

  const [formSponsor, setFormSponsor] = useState({ organisation: '', contact: '', email: '', telephone: '', pays: '', message: '' })
  const [submittedSponsor, setSubmittedSponsor] = useState(false)
  const [loadingSponsor, setLoadingSponsor] = useState(false)
  const [errorSponsor, setErrorSponsor] = useState('')

  const [formStrat, setFormStrat] = useState({ organisation: '', type_institution: '', pays: '', contact: '', email: '', telephone: '', message: '' })
  const [submittedStrat, setSubmittedStrat] = useState(false)
  const [loadingStrat, setLoadingStrat] = useState(false)
  const [errorStrat, setErrorStrat] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type')
    if (type === 'strategique' || type === 'sponsor') {
      setActiveSection(type)
      setSelectedOption(null)
    }
  }, [location.search])

  const handleSectionChange = (id) => {
    setActiveSection(id)
    setSelectedOption(null)
    setErrorSponsor('')
    setErrorStrat('')
  }

  const handleChangeSponsor = e => setFormSponsor({ ...formSponsor, [e.target.name]: e.target.value })
  const handleChangeStrat = e => setFormStrat({ ...formStrat, [e.target.name]: e.target.value })

  const handleSubmitSponsor = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorSponsor('Veuillez sélectionner un niveau de sponsoring ci-dessus.'); return }
    setLoadingSponsor(true); setErrorSponsor('')
    const { error } = await supabase.from('sponsors').insert([{ type: 'sponsor', option: selectedOption, ...formSponsor }])
    setLoadingSponsor(false)
    if (error) setErrorSponsor('Erreur : ' + error.message)
    else setSubmittedSponsor(true)
  }

  const handleSubmitStrat = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorStrat('Veuillez sélectionner un niveau de partenariat ci-dessus.'); return }
    setLoadingStrat(true); setErrorStrat('')
    const { error } = await supabase.from('partenaires_strategiques').insert([{ niveau: selectedOption, statut: 'en_attente', ...formStrat }])
    setLoadingStrat(false)
    if (error) setErrorStrat('Erreur : ' + error.message)
    else setSubmittedStrat(true)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10, color: '#111827',
    fontFamily: 'inherit',
    /* 16px minimum sur mobile pour éviter le zoom automatique iOS */
    fontSize: 16,
    outline: 'none', transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
    /* Empêche les inputs de déborder leur conteneur */
    maxWidth: '100%',
    minWidth: 0,
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#6b7280', marginBottom: 8,
  }

  const focusIn = e => {
    e.target.style.borderColor = '#0073F4'
    e.target.style.background = 'rgba(0,115,244,0.04)'
  }
  const focusOut = e => {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.background = '#f9fafb'
  }

  const selectedSponsor = SPONSORS.find(s => s.id === selectedOption)
  const selectedStrat = PARTENAIRES_STRATEGIQUES.find(p => p.id === selectedOption)

  /* ── RENDU DES CARTES D'OFFRES ── */
  const renderCards = (items) => items.map(item => (
    <div
      key={item.id}
      onClick={() => setSelectedOption(item.id)}
      style={{
        background: selectedOption === item.id ? item.accent : '#ffffff',
        border: `2px solid ${selectedOption === item.id ? item.color : '#e5e7eb'}`,
        borderRadius: 20,
        padding: 'clamp(18px, 4vw, 28px)',
        cursor: 'pointer',
        transition: 'all 0.25s',
        transform: selectedOption === item.id ? 'translateY(-6px)' : 'none',
        position: 'relative',
        boxShadow: selectedOption === item.id
          ? `0 16px 40px ${item.color}20`
          : '0 1px 4px rgba(0,0,0,0.06)',
        /* Empêche la carte de déborder sa cellule grid */
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Barre couleur en haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: item.color, borderRadius: '20px 20px 0 0',
        opacity: selectedOption === item.id ? 1 : 0.35,
      }} />

      {/* Coche de sélection */}
      {selectedOption === item.id && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: item.color, borderRadius: '50%',
          width: 24, height: 24, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 12, color: '#fff', fontWeight: 900,
          flexShrink: 0,
        }}>✓</div>
      )}

      {/* Badge */}
      {item.badge && (
        <div style={{
          display: 'inline-block', background: `${item.color}15`,
          border: `1px solid ${item.color}30`, borderRadius: 100,
          padding: '3px 12px', fontSize: 10, color: item.color,
          fontWeight: 700, letterSpacing: 0.5, marginBottom: 12,
          /* Empêche le badge de déborder sur mobile */
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.badge}
        </div>
      )}

      {/* Niveau */}
      <div style={{
        fontSize: 12, fontWeight: 800, color: item.color,
        letterSpacing: 2, textTransform: 'uppercase',
        marginBottom: 6, marginTop: item.badge ? 0 : 12,
        wordBreak: 'break-word',
      }}>
        {item.label}
      </div>

      {/* Prix */}
      <div style={{
        fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900,
        color: '#111827', marginBottom: 4, letterSpacing: '-0.02em',
        wordBreak: 'break-word',
      }}>
        {item.price}
      </div>

      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: item.desc ? 8 : 20 }}>
        participation unique
      </div>

      {/* Description (partenaires stratégiques) */}
      {item.desc && (
        <div style={{
          fontSize: 13, color: '#6b7280', marginBottom: 20,
          lineHeight: 1.6, wordBreak: 'break-word',
        }}>
          {item.desc}
        </div>
      )}

      {/* Séparateur */}
      <div style={{ height: 1, background: '#f3f4f6', marginBottom: 16 }} />

      {/* Liste des avantages */}
      {item.avantages.map((a, i) => (
        <div key={i} style={{
          display: 'flex', gap: 9, alignItems: 'flex-start',
          marginBottom: 9, fontSize: 12.5, color: '#374151', lineHeight: 1.5,
          /* Empêche le texte long de déborder */
          wordBreak: 'break-word', overflowWrap: 'break-word',
          minWidth: 0,
        }}>
          <span style={{ flexShrink: 0, marginTop: 2 }}>
            <CheckIcon color={item.color} />
          </span>
          <span>{a}</span>
        </div>
      ))}
    </div>
  ))

  return (
    <>
      <style>{`
        /*
          FIX OVERFLOW MOBILE
          overflow-x: clip coupe les éléments positionnés en absolu
          qui déborderaient (décors hero), sans créer de scrollbar.
          Plus efficace que overflow: hidden sur ce cas précis.
        */
        html {
          overflow-x: clip;
        }
        body {
          overflow-x: clip;
          max-width: 100%;
        }

        /* Empêche le zoom iOS au focus sur les inputs */
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }

        /* ── GRID CARTES SPONSORS (4 colonnes → 2 → 1) ── */
        .part-sponsors-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 1000px) {
          .part-sponsors-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 560px) {
          .part-sponsors-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── GRID CARTES PARTENAIRES STRAT (2 colonnes → 1) ── */
        .part-strat-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          width: 100%;
          min-width: 0;
        }
        @media (max-width: 720px) {
          .part-strat-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── GRID CHAMPS FORMULAIRE (2 col → 1) ── */
        .part-form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 14px;
          min-width: 0;
          width: 100%;
        }
        @media (max-width: 520px) {
          .part-form-row {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── SÉLECTEUR DE SECTION (2 col → 1) ── */
        .part-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 16px;
          padding: 8px;
          min-width: 0;
        }
        @media (max-width: 420px) {
          .part-section-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        /* ── PILLS DE SÉLECTION RAPIDE ── */
        .part-pills {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 36px;
          padding: 0 4px;
          min-width: 0;
        }
        .part-pill {
          border-radius: 100px;
          padding: 6px 16px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
          white-space: nowrap;
          /* Sur très petit écran, autorise le retour à la ligne */
          flex-shrink: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── STATS HERO ── */
        .part-hero-stats {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 36px;
          padding: 0 4px;
        }

        /* ── BOUTONS SECTION ── */
        .part-section-btn {
          background: transparent;
          border: none;
          border-radius: 10px;
          padding: 18px 14px;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }
        .part-section-btn:active {
          transform: scale(0.97);
        }

        /* ── CARTES : désactive le hover translateY sur mobile (touch) ── */
        @media (max-width: 520px) {
          .part-card-hover {
            transform: none !important;
          }
        }

        /* ── FORMULAIRE WRAPPER ── */
        .part-form-wrapper {
          background: #fff;
          border-radius: 24px;
          padding: clamp(22px, 5vw, 48px);
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* ── CHAMP INDIVIDUEL ── */
        .part-field {
          min-width: 0;
        }
        .part-field input,
        .part-field select,
        .part-field textarea {
          display: block;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        minHeight: '100vh',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        color: '#111827',
        /* Empêche tout contenu de forcer un scroll horizontal */
        overflowX: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <Navbar />

        {/* ── HERO ── */}
        <div style={{
          background: 'linear-gradient(160deg, #000E91 0%, #0073F4 100%)',
          padding: 'clamp(90px, 14vw, 150px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
          textAlign: 'center',
          position: 'relative',
          /* overflow:hidden coupe les décors absolus DANS le hero */
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Décors — tailles réduites pour rester dans le hero */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -30,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(0,0,0,0.10)', pointerEvents: 'none',
          }} />

          {/* Pill label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 100, padding: '7px 22px', marginBottom: 24,
            /* Sur très petit écran, le pill passe à la ligne correctement */
            maxWidth: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3,
              textTransform: 'uppercase', color: '#fff',
            }}>
              COPAF 2026 · Maroc
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 58px)', fontWeight: 900,
            marginBottom: 18, lineHeight: 1.1, letterSpacing: '-0.02em',
            color: '#fff',
            wordBreak: 'break-word', overflowWrap: 'break-word',
          }}>
            Sponsors &amp; <span style={{ color: 'rgba(255,255,255,0.75)' }}>Partenaires</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 580, margin: '0 auto', lineHeight: 1.8,
            wordBreak: 'break-word',
          }}>
            Associez votre organisation à la première conférence africaine sur les ports et la logistique maritime.
          </p>

          <div className="part-hero-stats">
            {['500+ Participants', '25+ Pays', '3 Jours', 'Maroc 2026'].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 100, padding: '8px 18px',
                fontSize: 13, fontWeight: 600, color: '#fff',
                whiteSpace: 'nowrap',
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENU PRINCIPAL ── */}
        <div style={{
          padding: 'clamp(50px, 8vw, 90px) clamp(16px, 5vw, 60px)',
          background: '#f8f9ff',
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}>

          {/* ── SÉLECTEUR DE SECTION ── */}
          <div style={{
            maxWidth: 600, margin: '0 auto 60px',
            textAlign: 'center',
            minWidth: 0,
          }}>
            <p style={{
              color: '#9ca3af', fontSize: 12, fontWeight: 700,
              letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20,
            }}>
              Choisissez votre type de partenariat
            </p>
            <div className="part-section-grid">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  className="part-section-btn"
                  onClick={() => handleSectionChange(s.id)}
                  style={{
                    background: activeSection === s.id
                      ? 'linear-gradient(135deg, #000E91, #0073F4)'
                      : 'transparent',
                    color: activeSection === s.id ? '#fff' : '#374151',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{
                    fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 800,
                    wordBreak: 'break-word',
                  }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 4, lineHeight: 1.4,
                    color: activeSection === s.id ? 'rgba(255,255,255,0.75)' : '#9ca3af',
                    wordBreak: 'break-word',
                  }}>
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              SECTION SPONSORS
          ══════════════════════════════════════════════════ */}
          {activeSection === 'sponsor' && (
            <>
              <div style={{ maxWidth: 1200, margin: '0 auto 70px', minWidth: 0 }}>
                <h2 style={{
                  textAlign: 'center',
                  fontSize: 'clamp(18px, 3vw, 32px)',
                  fontWeight: 900, marginBottom: 10, color: '#111827',
                  wordBreak: 'break-word',
                }}>
                  Choisissez votre <span style={{ color: '#0073F4' }}>niveau de sponsoring</span>
                </h2>
                <p style={{
                  textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 36,
                }}>
                  Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire ci-dessous
                </p>

                {/* Pills de sélection rapide */}
                <div className="part-pills">
                  {SPONSORS.map(s => (
                    <div
                      key={s.id}
                      className="part-pill"
                      onClick={() => setSelectedOption(s.id)}
                      style={{
                        background: selectedOption === s.id ? s.accent : '#fff',
                        border: `1.5px solid ${selectedOption === s.id ? s.color : '#e5e7eb'}`,
                        color: selectedOption === s.id ? s.color : '#6b7280',
                      }}
                    >
                      {s.label} — {s.price}
                    </div>
                  ))}
                </div>

                {/* Grille des 4 offres */}
                <div className="part-sponsors-grid">
                  {renderCards(SPONSORS)}
                </div>
              </div>

              {/* Formulaire sponsor */}
              <div style={{ maxWidth: 680, margin: '0 auto', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                <div
                  className="part-form-wrapper"
                  style={{ border: '1.5px solid #e5e7eb', boxShadow: '0 8px 40px rgba(0,14,145,0.08)' }}
                >
                  {submittedSponsor ? (
                    <SuccessBlock contact={formSponsor.contact} />
                  ) : (
                    <>
                      <h3 style={{
                        fontSize: 20, fontWeight: 900, marginBottom: 6,
                        textAlign: 'center', color: '#111827',
                      }}>
                        Formulaire de demande Sponsor
                      </h3>
                      <p style={{
                        color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 32,
                        wordBreak: 'break-word',
                      }}>
                        {selectedOption
                          ? <><span style={{ color: '#6b7280' }}>Niveau sélectionné : </span><strong style={{ color: '#0073F4' }}>Sponsor {selectedSponsor?.label} — {selectedSponsor?.price}</strong></>
                          : <span style={{ color: '#ef4444' }}>⚠️ Sélectionnez un niveau ci-dessus</span>}
                      </p>
                      <form onSubmit={handleSubmitSponsor} style={{ minWidth: 0, width: '100%' }}>
                        <div className="part-form-row">
                          <div className="part-field">
                            <label style={labelStyle}>Organisation *</label>
                            <input name="organisation" value={formSponsor.organisation} onChange={handleChangeSponsor} required placeholder="Votre organisation" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div className="part-field">
                            <label style={labelStyle}>Nom du contact *</label>
                            <input name="contact" value={formSponsor.contact} onChange={handleChangeSponsor} required placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                        </div>
                        <div className="part-form-row">
                          <div className="part-field">
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" value={formSponsor.email} onChange={handleChangeSponsor} required placeholder="votre@email.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div className="part-field">
                            <label style={labelStyle}>Téléphone</label>
                            <input name="telephone" type="tel" value={formSponsor.telephone} onChange={handleChangeSponsor} placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>Pays *</label>
                          <input name="pays" value={formSponsor.pays} onChange={handleChangeSponsor} required placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                          <label style={labelStyle}>Message / Attentes</label>
                          <textarea name="message" value={formSponsor.message} onChange={handleChangeSponsor} placeholder="Vos objectifs, attentes ou questions..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        {errorSponsor && <ErrorBlock msg={errorSponsor} />}
                        <SubmitButton loading={loadingSponsor} label="Envoyer ma demande Sponsor 💎" />
                        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
                          Notre équipe vous répondra sous 48h ouvrées.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════
              SECTION PARTENAIRES STRATÉGIQUES
          ══════════════════════════════════════════════════ */}
          {activeSection === 'strategique' && (
            <>
              <div style={{ maxWidth: 900, margin: '0 auto 70px', minWidth: 0 }}>
                <h2 style={{
                  textAlign: 'center',
                  fontSize: 'clamp(18px, 3vw, 32px)',
                  fontWeight: 900, marginBottom: 10, color: '#111827',
                  wordBreak: 'break-word',
                }}>
                  Choisissez votre <span style={{ color: '#000E91' }}>niveau de partenariat</span>
                </h2>
                <p style={{
                  textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 36,
                }}>
                  Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire ci-dessous
                </p>

                {/* Pills de sélection rapide */}
                <div className="part-pills">
                  {PARTENAIRES_STRATEGIQUES.map(p => (
                    <div
                      key={p.id}
                      className="part-pill"
                      onClick={() => setSelectedOption(p.id)}
                      style={{
                        background: selectedOption === p.id ? p.accent : '#fff',
                        border: `1.5px solid ${selectedOption === p.id ? p.color : '#e5e7eb'}`,
                        color: selectedOption === p.id ? p.color : '#6b7280',
                      }}
                    >
                      {p.short} — {p.price}
                    </div>
                  ))}
                </div>

                {/* Grille des 2 offres */}
                <div className="part-strat-grid">
                  {renderCards(PARTENAIRES_STRATEGIQUES)}
                </div>
              </div>

              {/* Formulaire partenaire stratégique */}
              <div style={{ maxWidth: 680, margin: '0 auto', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                <div
                  className="part-form-wrapper"
                  style={{ border: '1.5px solid rgba(0,14,145,0.12)', boxShadow: '0 8px 40px rgba(0,14,145,0.10)' }}
                >
                  {submittedStrat ? (
                    <SuccessBlock contact={formStrat.contact} />
                  ) : (
                    <>
                      <h3 style={{
                        fontSize: 20, fontWeight: 900, marginBottom: 6,
                        textAlign: 'center', color: '#111827',
                      }}>
                        Formulaire de demande Partenariat
                      </h3>
                      <p style={{
                        color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 32,
                        wordBreak: 'break-word',
                      }}>
                        {selectedOption
                          ? <><span style={{ color: '#6b7280' }}>Niveau sélectionné : </span><strong style={{ color: '#000E91' }}>{selectedStrat?.label} — {selectedStrat?.price}</strong></>
                          : <span style={{ color: '#ef4444' }}>⚠️ Sélectionnez un niveau ci-dessus</span>}
                      </p>
                      <form onSubmit={handleSubmitStrat} style={{ minWidth: 0, width: '100%' }}>
                        <div className="part-form-row">
                          <div className="part-field">
                            <label style={labelStyle}>Organisation / Port *</label>
                            <input name="organisation" value={formStrat.organisation} onChange={handleChangeStrat} required placeholder="Ex : Port de Lomé" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div className="part-field">
                            <label style={labelStyle}>Type d'institution *</label>
                            <select
                              name="type_institution"
                              value={formStrat.type_institution}
                              onChange={handleChangeStrat}
                              required
                              style={{
                                ...inputStyle,
                                cursor: 'pointer',
                                color: formStrat.type_institution ? '#111827' : '#9ca3af',
                                /* iOS peut déborder — on force */
                                maxWidth: '100%',
                              }}
                              onFocus={focusIn}
                              onBlur={focusOut}
                            >
                              <option value="" disabled>Sélectionner...</option>
                              {[
                                'Port / Autorité portuaire',
                                'Ministère / Gouvernement',
                                'Organisation régionale (AGPAOC, UA...)',
                                'Organisme de financement',
                                'Autre institution',
                              ].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>Pays *</label>
                          <input name="pays" value={formStrat.pays} onChange={handleChangeStrat} required placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div className="part-form-row">
                          <div className="part-field">
                            <label style={labelStyle}>Nom du contact *</label>
                            <input name="contact" value={formStrat.contact} onChange={handleChangeStrat} required placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div className="part-field">
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" value={formStrat.email} onChange={handleChangeStrat} required placeholder="votre@institution.org" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>Téléphone</label>
                          <input name="telephone" type="tel" value={formStrat.telephone} onChange={handleChangeStrat} placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                          <label style={labelStyle}>Message / Attentes</label>
                          <textarea
                            name="message"
                            value={formStrat.message}
                            onChange={handleChangeStrat}
                            placeholder="Décrivez vos attentes, vos objectifs..."
                            rows={4}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            onFocus={focusIn}
                            onBlur={focusOut}
                          />
                        </div>
                        {errorStrat && <ErrorBlock msg={errorStrat} />}
                        <SubmitButton loading={loadingStrat} label="Envoyer ma demande 🏛️" colorA="#000E91" colorB="#0073F4" />
                        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
                          Notre équipe vous répondra sous 48h ouvrées.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Partenariats