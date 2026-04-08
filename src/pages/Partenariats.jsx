import { useState } from 'react'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── DONNÉES ───────────────────────────────────────────────────────────────

const TYPES = [
  { id: 'sponsor',     label: 'Sponsor',     emoji: '💎', desc: 'Financez et valorisez votre marque' },
  { id: 'partenaire',  label: 'Partenaire',  emoji: '🏛️', desc: 'Association institutionnelle officielle' },
  { id: 'exposant',    label: 'Exposant',    emoji: '💻', desc: 'Vitrine digitale de vos solutions' },
]

const SPONSORS = [
  {
    id: 'platine', label: 'Platine', price: '15 000 €', color: '#e5e4e2', accent: 'rgba(229,228,226,0.15)',
    avantages: [
      'Logo PREMIUM sur le site COPAF (position 1)',
      'Logo sur toutes les tablettes distribuées',
      'Mention dans tous les emails participants',
      '5 badges participants inclus',
      'Prise de parole plénière — 15 min',
      'Atelier/session dédiée',
      'Page dédiée sur le site COPAF',
      'PDF + Vidéo sur les tablettes',
      'Co-branding sur tous les supports',
    ]
  },
  {
    id: 'or', label: 'Or', price: '8 000 €', color: '#FFD700', accent: 'rgba(255,215,0,0.12)',
    avantages: [
      'Logo sur le site COPAF',
      'Logo sur les tablettes distribuées',
      'Mention dans les emails participants',
      '3 badges participants inclus',
      'Session/atelier — 15 min',
      'Page dédiée sur le site COPAF',
      'PDF + Vidéo sur les tablettes',
    ]
  },
  {
    id: 'argent', label: 'Argent', price: '4 000 €', color: '#C0C0C0', accent: 'rgba(192,192,192,0.1)',
    avantages: [
      'Logo sur le site COPAF',
      'Logo sur les tablettes distribuées',
      'Mention dans les emails participants',
      '2 badges participants inclus',
      'PDF/brochure sur les tablettes',
    ]
  },
  {
    id: 'bronze', label: 'Bronze', price: '2 000 €', color: '#cd7f32', accent: 'rgba(205,127,50,0.1)',
    avantages: [
      'Logo sur le site COPAF',
      'Logo sur les tablettes distribuées',
      'Mention dans les emails participants',
      '1 badge participant inclus',
    ]
  },
]

const PARTENAIRES = [
  {
    id: 'institutionnel', label: 'Institutionnel', emoji: '🏛️', color: '#00cc88',
    desc: 'Ports, ministères, organisations régionales (AGPAOC, UA...)',
    avantages: [
      'Co-branding sur tous les supports officiels',
      'Délégation officielle accueillie à la conférence',
      'Tribune officielle — prise de parole',
      'Mention "Partenaire Officiel" sur tous les supports',
      'Logo sur le site COPAF + tablettes',
    ]
  },
  {
    id: 'media', label: 'Média', emoji: '📺', color: '#ff6b9d',
    desc: 'Presse, TV, radio, médias en ligne',
    avantages: [
      'Accréditation presse complète',
      'Interviews exclusives avec les intervenants',
      'Contenu co-brandé COPAF × Média',
      'Mention "Partenaire Média Officiel"',
      'Logo sur le site COPAF + programme',
    ]
  },
  {
    id: 'academique', label: 'Académique', emoji: '🎓', color: '#9b59b6',
    desc: 'Universités, centres de recherche, think tanks',
    avantages: [
      'Publication dans les actes de conférence',
      'Présentation de recherches — 15 min',
      'Mention "Partenaire Académique"',
      'Logo sur le site COPAF + programme',
      'Accès aux données et résultats de la conférence',
    ]
  },
]

const EXPOSANTS = [
  {
    id: 'essentielle', label: 'Essentielle', price: '500 €', color: '#0073f4',
    avantages: [
      'Fiche entreprise sur le site COPAF',
      'Logo + description + lien vers votre site',
      '1 PDF/brochure sur les tablettes',
      'QR code dans le programme numérique',
    ]
  },
  {
    id: 'avancee', label: 'Avancée', price: '1 200 €', color: '#FFD700',
    avantages: [
      'Tout de la formule Essentielle',
      'Vidéo de présentation (5 min) sur les tablettes',
      'Session pitch 10–15 min pendant la conférence',
      '1 badge participant inclus',
      'Page dédiée sur le site COPAF',
    ]
  },
  {
    id: 'premium', label: 'Premium', price: '2 500 €', color: '#00cc88',
    avantages: [
      'Tout de la formule Avancée',
      'Démonstration produit — 15 min',
      '2 badges participants inclus',
      'Contenu prioritaire sur les tablettes',
      'Mise en avant sur la page d\'accueil COPAF',
    ]
  },
]

const SECTEURS = [
  'Solutions Digitales & Logiciels',
  'Intelligence Artificielle & Data',
  'Sécurité & Sûreté Portuaire',
  'Énergie & Environnement',
  'Logistique & Transport Maritime',
  'Formation & Conseil',
  'Finance & Assurance Maritime',
  'Autre',
]

// ─── COMPOSANTS UI ──────────────────────────────────────────────────────────

const CheckIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.15" />
    <polyline points="3.5 7 5.5 9.5 10.5 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

const Partenariats = () => {
  const [activeType, setActiveType] = useState('sponsor')
  const [selectedOption, setSelectedOption] = useState(null)
  const [selectedSecteur, setSelectedSecteur] = useState('')
  const [form, setForm] = useState({
    organisation: '', contact: '', email: '',
    telephone: '', pays: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleTypeChange = (type) => {
    setActiveType(type)
    setSelectedOption(null)
    setErrorMsg('')
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorMsg('Veuillez sélectionner une option.'); return }
    if (activeType === 'exposant' && !selectedSecteur) { setErrorMsg('Veuillez sélectionner votre secteur d\'activité.'); return }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.from('partenariats').insert([{
      type: activeType,
      option: selectedOption,
      secteur: activeType === 'exposant' ? selectedSecteur : null,
      organisation: form.organisation,
      contact: form.contact,
      email: form.email,
      telephone: form.telephone,
      pays: form.pays,
      message: form.message,
    }])

    setLoading(false)
    if (error) setErrorMsg('Erreur : ' + error.message)
    else setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#FFFFFF',
    fontFamily: 'inherit', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', marginBottom: 8
  }

  const focusIn = e => { e.target.style.borderColor = '#0073f4'; e.target.style.background = 'rgba(0,115,244,0.05)' }
  const focusOut = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  // Données selon le type actif
  const currentData = activeType === 'sponsor' ? SPONSORS : activeType === 'partenaire' ? PARTENAIRES : EXPOSANTS

  // Label de l'option sélectionnée
  const selectedLabel = selectedOption
    ? currentData.find(d => d.id === selectedOption)?.label
    : null

  return (
    <div style={{
      background: '#060a14', minHeight: '100vh',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#FFFFFF'
    }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, #060a14 0%, #000e91 60%, #0073f4 100%)',
        padding: 'clamp(90px, 14vw, 150px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,115,244,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,14,145,0.15)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 100, padding: '7px 22px', marginBottom: 24,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0073f4' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            COPAF 2026 · Maroc
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(30px, 5vw, 58px)', fontWeight: 900, marginBottom: 18, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Sponsors, Partenaires<br />
          <span style={{ color: '#0073f4' }}>&amp; Exposants</span>
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
          Associez votre organisation à la première conférence africaine sur les ports et la logistique maritime.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          {['500+ Participants', '25+ Pays', '3 Jours', 'Maroc 2026'].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600,
            }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: 'clamp(50px, 8vw, 90px) clamp(20px, 5vw, 60px)' }}>

        {/* ── SÉLECTEUR DE TYPE ── */}
        <div style={{ maxWidth: 700, margin: '0 auto 60px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            Je souhaite devenir
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 8,
          }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => handleTypeChange(t.id)} style={{
                background: activeType === t.id ? '#0073f4' : 'transparent',
                border: 'none', borderRadius: 10, padding: '16px 12px',
                cursor: 'pointer', transition: 'all 0.25s', color: '#FFFFFF',
                fontFamily: 'inherit',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: activeType === t.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENU SELON TYPE ── */}

        {/* SPONSORS */}
        {activeType === 'sponsor' && (
          <div style={{ maxWidth: 1100, margin: '0 auto 70px' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
              Choisissez votre <span style={{ color: '#0073f4' }}>niveau de sponsoring</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 40 }}>
              Cliquez sur un niveau pour le sélectionner
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
              {SPONSORS.map(s => (
                <div key={s.id} onClick={() => setSelectedOption(s.id)} style={{
                  background: selectedOption === s.id ? s.accent : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${selectedOption === s.id ? s.color : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 18, padding: 24, cursor: 'pointer',
                  transition: 'all 0.25s',
                  transform: selectedOption === s.id ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                }}>
                  {selectedOption === s.id && (
                    <div style={{ position: 'absolute', top: 14, right: 14, background: s.color, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#060a14', fontWeight: 900 }}>✓</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 20 }}>{s.price}</div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />
                  {s.avantages.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><CheckIcon color={s.color} /></span>
                      {a}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARTENAIRES */}
        {activeType === 'partenaire' && (
          <div style={{ maxWidth: 900, margin: '0 auto 70px' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
              Choisissez votre <span style={{ color: '#0073f4' }}>type de partenariat</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 12 }}>
              Partenariat par échange de visibilité — sans contrepartie financière
            </p>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginBottom: 40 }}>
              Cliquez sur un type pour le sélectionner
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
              {PARTENAIRES.map(p => (
                <div key={p.id} onClick={() => setSelectedOption(p.id)} style={{
                  background: selectedOption === p.id ? `rgba(${p.id === 'institutionnel' ? '0,204,136' : p.id === 'media' ? '255,107,157' : '155,89,182'},0.1)` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${selectedOption === p.id ? p.color : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 18, padding: 28, cursor: 'pointer',
                  transition: 'all 0.25s',
                  transform: selectedOption === p.id ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                }}>
                  {selectedOption === p.id && (
                    <div style={{ position: 'absolute', top: 14, right: 14, background: p.color, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#060a14', fontWeight: 900 }}>✓</div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: p.color, marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 20, lineHeight: 1.5 }}>{p.desc}</div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />
                  {p.avantages.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><CheckIcon color={p.color} /></span>
                      {a}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPOSANTS */}
        {activeType === 'exposant' && (
          <div style={{ maxWidth: 1000, margin: '0 auto 70px' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
              Choisissez votre <span style={{ color: '#0073f4' }}>formule exposant</span>
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 8 }}>
              Exposition 100% digitale — site web COPAF + tablettes distribuées aux participants
            </p>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <a href="/exposition-digitale" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#0073f4', fontSize: 13, textDecoration: 'none',
                border: '1px solid rgba(0,115,244,0.3)', borderRadius: 100,
                padding: '6px 16px', transition: 'all 0.2s',
              }}>
                📱 Comment fonctionne l'exposition digitale ?
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 40 }}>
              {EXPOSANTS.map(ex => (
                <div key={ex.id} onClick={() => setSelectedOption(ex.id)} style={{
                  background: selectedOption === ex.id ? `rgba(${ex.id === 'essentielle' ? '0,115,244' : ex.id === 'avancee' ? '255,215,0' : '0,204,136'},0.1)` : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${selectedOption === ex.id ? ex.color : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 18, padding: 28, cursor: 'pointer',
                  transition: 'all 0.25s',
                  transform: selectedOption === ex.id ? 'translateY(-4px)' : 'none',
                  position: 'relative',
                }}>
                  {selectedOption === ex.id && (
                    <div style={{ position: 'absolute', top: 14, right: 14, background: ex.color, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#060a14', fontWeight: 900 }}>✓</div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 800, color: ex.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{ex.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', marginBottom: 20 }}>{ex.price}</div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />
                  {ex.avantages.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 9, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}><CheckIcon color={ex.color} /></span>
                      {a}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Sélecteur de secteur */}
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <label style={{ ...labelStyle, textAlign: 'center', display: 'block', marginBottom: 16 }}>
                Votre secteur d'activité *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 10 }}>
                {SECTEURS.map(s => (
                  <div key={s} onClick={() => setSelectedSecteur(s)} style={{
                    background: selectedSecteur === s ? 'rgba(0,115,244,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selectedSecteur === s ? '#0073f4' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                    fontSize: 12, color: selectedSecteur === s ? '#7ab8ff' : 'rgba(255,255,255,0.5)',
                    fontWeight: selectedSecteur === s ? 700 : 400,
                    transition: 'all 0.2s', textAlign: 'center', lineHeight: 1.4,
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FORMULAIRE UNIQUE ── */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #000e91, #0073f4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', fontSize: 32,
                }}>✓</div>
                <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: '#0073f4', marginBottom: 10 }}>
                  Demande enregistrée !
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
                  Merci <strong style={{ color: '#FFFFFF' }}>{form.contact}</strong>.<br />
                  Notre équipe vous contactera dans les <strong style={{ color: '#0073f4' }}>48h</strong> pour finaliser votre partenariat.
                </p>
                <div style={{
                  background: 'rgba(0,115,244,0.07)', border: '1px solid rgba(0,115,244,0.15)',
                  borderRadius: 12, padding: '20px 24px', textAlign: 'left',
                }}>
                  {[
                    '📧 Email de confirmation envoyé',
                    '📞 Appel de présentation planifié',
                    '📄 Dossier de partenariat envoyé',
                    '✍️ Contrat préparé selon votre choix',
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '8px 0', fontSize: 13.5, color: 'rgba(255,255,255,0.6)', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>{s}</div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: 'center' }}>
                  Formulaire de contact
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                  {selectedLabel
                    ? <>Type : <strong style={{ color: '#0073f4' }}>{TYPES.find(t => t.id === activeType)?.label}</strong> · Option : <strong style={{ color: '#0073f4' }}>{selectedLabel}</strong></>
                    : 'Sélectionnez une option ci-dessus puis remplissez ce formulaire'
                  }
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Organisation / Entreprise *</label>
                      <input name="organisation" value={form.organisation} onChange={handleChange} required
                        placeholder="Votre organisation" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nom du contact *</label>
                      <input name="contact" value={form.contact} onChange={handleChange} required
                        placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required
                        placeholder="votre@email.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input name="telephone" value={form.telephone} onChange={handleChange}
                        placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Pays *</label>
                    <input name="pays" value={form.pays} onChange={handleChange} required
                      placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Message / Attentes</label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Vos objectifs, attentes ou questions..." rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  {errorMsg && (
                    <div style={{
                      background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
                      borderRadius: 10, padding: '12px 16px', marginBottom: 18,
                      fontSize: 13, color: '#f87171',
                    }}>
                      ✕ {errorMsg}
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '16px',
                    background: loading ? 'rgba(0,115,244,0.4)' : 'linear-gradient(135deg, #000e91 0%, #0073f4 100%)',
                    color: '#FFFFFF', border: 'none', borderRadius: 12,
                    fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
                    letterSpacing: 1.5, textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 8px 28px rgba(0,115,244,0.35)',
                    transition: 'all 0.2s',
                  }}>
                    {loading ? '⏳ Envoi en cours…' : `Envoyer ma demande ${TYPES.find(t => t.id === activeType)?.emoji}`}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
                    Notre équipe vous répondra sous 48h ouvrées.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Partenariats