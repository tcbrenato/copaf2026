import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

// ─── DONNÉES ───────────────────────────────────────────────────────────────

// Sélecteur principal : 2 sections sur /partenariats
const SECTIONS = [
  {
    id: 'sponsor',
    label: 'Sponsors Catalogue',
    emoji: '💎',
    desc: 'Offre standardisée, tarifs fixes',
  },
  {
    id: 'strategique',
    label: 'Partenaires Stratégiques',
    emoji: '🏛️',
    desc: 'Ports & institutions, sur-mesure',
  },
]

const SPONSORS = [
  {
    id: 'platine',
    label: 'Platine',
    price: '20 000 €',
    priceRaw: 20000,
    color: '#e8e0d0',
    accent: 'rgba(232,224,208,0.12)',
    badge: '👑 Niveau supérieur',
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
    id: 'or',
    label: 'Or',
    price: '16 000 €',
    priceRaw: 16000,
    color: '#FFD700',
    accent: 'rgba(255,215,0,0.10)',
    badge: '⭐ Très populaire',
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
    id: 'argent',
    label: 'Argent',
    price: '10 000 €',
    priceRaw: 10000,
    color: '#C0C0C0',
    accent: 'rgba(192,192,192,0.08)',
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
    id: 'bronze',
    label: 'Bronze',
    price: '8 000 €',
    priceRaw: 8000,
    color: '#cd7f32',
    accent: 'rgba(205,127,50,0.08)',
    avantages: [
      'Être membre de COPAF et bénéficier des conférences COPAF à travers le monde',
      'Espace sur les lieux de la conférence de Rabat',
      "Logo de l'entreprise sur le site de la conférence",
      'Certificat de partenariat décerné à la fin de la conférence',
      'Un (01) ticket de participation inclus',
      'Possibilité de mettre son branding sur les supports',
      'Parution de logo dans le magazine de Recap COPAF',
      'Logo de la société dans la newsletter COPAF',
    ],
  },
]

// Partenaires stratégiques confirmés (affichage statique)
const PARTENAIRES_CONFIRMES = [
  { nom: 'Tanger Med', role: 'Partenaire Stratégique Principal', pays: 'Maroc', emoji: '🇲🇦' },
  { nom: 'HAROPA Le Havre', role: 'Partenaire Smart Port', pays: 'France', emoji: '🇫🇷' },
  { nom: 'Port de Casablanca', role: "Partenaire d'Accueil", pays: 'Maroc', emoji: '🇲🇦' },
  { nom: 'Marseille Fos', role: 'Partenaire Smart Port', pays: 'France', emoji: '🇫🇷' },
  { nom: 'Port de Sète', role: 'Partenaire Smart Port', pays: 'France', emoji: '🇫🇷' },
  { nom: 'Port de Dunkerque', role: 'Partenaire Smart Port', pays: 'France', emoji: '🇫🇷' },
]

// Étapes du processus Partenaire Stratégique
const ETAPES_STRATEGIQUE = [
  {
    num: '01',
    titre: 'Prise de contact',
    desc: 'Remplissez le formulaire ci-dessous. Notre équipe analyse votre profil sous 48h.',
    icon: '📋',
  },
  {
    num: '02',
    titre: 'Construction du package',
    desc: "Nous co-construisons avec vous un partenariat sur-mesure : contribution financière, apports en nature, visibilité.",
    icon: '🤝',
  },
  {
    num: '03',
    titre: 'Convention officielle',
    desc: "Signature de la convention de partenariat et mise en place de votre présence à la COPAF 2026.",
    icon: '✍️',
  },
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
  const location = useLocation()

  const getInitialSection = () => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type')
    if (type === 'strategique') return 'strategique'
    return 'sponsor'
  }

  const [activeSection, setActiveSection] = useState(getInitialSection)
  const [selectedOption, setSelectedOption] = useState(null)

  // ── État formulaire Sponsor ──
  const [formSponsor, setFormSponsor] = useState({
    organisation: '', contact: '', email: '', telephone: '', pays: '', message: '',
  })
  const [submittedSponsor, setSubmittedSponsor] = useState(false)
  const [loadingSponsor, setLoadingSponsor] = useState(false)
  const [errorSponsor, setErrorSponsor] = useState('')

  // ── État formulaire Partenaire Stratégique ──
  const [formStrat, setFormStrat] = useState({
    organisation: '', type_institution: '', pays: '', contact: '', email: '', message: '',
  })
  const [submittedStrat, setSubmittedStrat] = useState(false)
  const [loadingStrat, setLoadingStrat] = useState(false)
  const [errorStrat, setErrorStrat] = useState('')
  const [showFormStrat, setShowFormStrat] = useState(false)

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

  // Soumission Sponsor → table `sponsors`
  const handleSubmitSponsor = async e => {
    e.preventDefault()
    if (!selectedOption) { setErrorSponsor('Veuillez sélectionner un niveau de sponsoring ci-dessus.'); return }
    setLoadingSponsor(true)
    setErrorSponsor('')
    const { error } = await supabase.from('sponsors').insert([{
      type: 'sponsor',
      option: selectedOption,
      organisation: formSponsor.organisation,
      contact: formSponsor.contact,
      email: formSponsor.email,
      telephone: formSponsor.telephone,
      pays: formSponsor.pays,
      message: formSponsor.message,
    }])
    setLoadingSponsor(false)
    if (error) setErrorSponsor('Erreur : ' + error.message)
    else setSubmittedSponsor(true)
  }

  // Soumission Partenaire Stratégique → table `partenaires_strategiques`
  const handleSubmitStrat = async e => {
    e.preventDefault()
    setLoadingStrat(true)
    setErrorStrat('')
    const { error } = await supabase.from('partenaires_strategiques').insert([{
      organisation: formStrat.organisation,
      type_institution: formStrat.type_institution,
      pays: formStrat.pays,
      contact: formStrat.contact,
      email: formStrat.email,
      message: formStrat.message,
      statut: 'en_attente',
    }])
    setLoadingStrat(false)
    if (error) setErrorStrat('Erreur : ' + error.message)
    else setSubmittedStrat(true)
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
    color: 'rgba(255,255,255,0.4)', marginBottom: 8,
  }
  const focusIn = e => { e.target.style.borderColor = '#0073f4'; e.target.style.background = 'rgba(0,115,244,0.05)' }
  const focusOut = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  const selectedSponsor = selectedOption ? SPONSORS.find(s => s.id === selectedOption) : null

  return (
    <div style={{
      background: '#060a14', minHeight: '100vh',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#FFFFFF',
    }}>
      <Navbar />

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, #060a14 0%, #000e91 60%, #0073f4 100%)',
        padding: 'clamp(90px, 14vw, 150px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
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
          Sponsors &amp; <span style={{ color: '#0073f4' }}>Partenaires</span>
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

      <div id="partenariat-content" style={{ padding: 'clamp(50px, 8vw, 90px) clamp(20px, 5vw, 60px)' }}>

        {/* ── SÉLECTEUR DE SECTION ── */}
        <div style={{ maxWidth: 600, margin: '0 auto 60px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            Choisissez votre type de partenariat
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 8,
          }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => handleSectionChange(s.id)} style={{
                background: activeSection === s.id ? '#0073f4' : 'transparent',
                border: 'none', borderRadius: 10, padding: '18px 14px',
                cursor: 'pointer', transition: 'all 0.25s', color: '#FFFFFF',
                fontFamily: 'inherit',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: activeSection === s.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginTop: 4, lineHeight: 1.4 }}>
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION A — SPONSORS CATALOGUE
        ══════════════════════════════════════════ */}
        {activeSection === 'sponsor' && (
          <>
            <div style={{ maxWidth: 1200, margin: '0 auto 70px' }}>
              <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
                Choisissez votre <span style={{ color: '#0073f4' }}>niveau de sponsoring</span>
              </h2>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36 }}>
                Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire ci-dessous
              </p>

              {/* Pills résumé */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                {SPONSORS.map(s => (
                  <div key={s.id} onClick={() => setSelectedOption(s.id)} style={{
                    background: selectedOption === s.id ? s.accent : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${selectedOption === s.id ? s.color : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 100, padding: '6px 18px', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    color: selectedOption === s.id ? s.color : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}>
                    {s.label} — {s.price}
                  </div>
                ))}
              </div>

              {/* Cartes sponsors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
                {SPONSORS.map(s => (
                  <div key={s.id} onClick={() => setSelectedOption(s.id)} style={{
                    background: selectedOption === s.id ? s.accent : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${selectedOption === s.id ? s.color : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 20, padding: 28, cursor: 'pointer',
                    transition: 'all 0.25s',
                    transform: selectedOption === s.id ? 'translateY(-6px)' : 'none',
                    position: 'relative',
                    boxShadow: selectedOption === s.id ? `0 16px 40px ${s.color}22` : 'none',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: s.color, borderRadius: '20px 20px 0 0',
                      opacity: selectedOption === s.id ? 1 : 0.4,
                    }} />

                    {selectedOption === s.id && (
                      <div style={{
                        position: 'absolute', top: 16, right: 16,
                        background: s.color, borderRadius: '50%',
                        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: '#060a14', fontWeight: 900,
                      }}>✓</div>
                    )}

                    {s.badge && (
                      <div style={{
                        display: 'inline-block',
                        background: `${s.color}22`, border: `1px solid ${s.color}44`,
                        borderRadius: 100, padding: '3px 12px',
                        fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 0.5,
                        marginBottom: 12,
                      }}>
                        {s.badge}
                      </div>
                    )}

                    <div style={{ fontSize: 13, fontWeight: 800, color: s.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, marginTop: s.badge ? 0 : 12 }}>
                      Sponsor {s.label}
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {s.price}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 22 }}>participation unique</div>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

                    {s.avantages.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                        <span style={{ flexShrink: 0, marginTop: 2 }}><CheckIcon color={s.color} /></span>
                        {a}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire Sponsor */}
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{
                background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              }}>
                {submittedSponsor ? (
                  <SuccessBlock
                    contact={formSponsor.contact}
                    option={selectedSponsor?.label}
                    type="sponsor"
                  />
                ) : (
                  <>
                    <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: 'center' }}>
                      Formulaire de demande Sponsor
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                      {selectedOption
                        ? <>Niveau sélectionné : <strong style={{ color: '#0073f4' }}>Sponsor {selectedSponsor?.label} — {selectedSponsor?.price}</strong></>
                        : <span style={{ color: '#f87171' }}>⚠️ Sélectionnez un niveau ci-dessus avant de remplir ce formulaire</span>
                      }
                    </p>

                    <form onSubmit={handleSubmitSponsor}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Organisation *</label>
                          <input name="organisation" value={formSponsor.organisation} onChange={handleChangeSponsor} required
                            placeholder="Votre organisation" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                          <label style={labelStyle}>Nom du contact *</label>
                          <input name="contact" value={formSponsor.contact} onChange={handleChangeSponsor} required
                            placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={labelStyle}>Email *</label>
                          <input name="email" type="email" value={formSponsor.email} onChange={handleChangeSponsor} required
                            placeholder="votre@email.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                        <div>
                          <label style={labelStyle}>Téléphone</label>
                          <input name="telephone" value={formSponsor.telephone} onChange={handleChangeSponsor}
                            placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Pays *</label>
                        <input name="pays" value={formSponsor.pays} onChange={handleChangeSponsor} required
                          placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Message / Attentes</label>
                        <textarea name="message" value={formSponsor.message} onChange={handleChangeSponsor}
                          placeholder="Vos objectifs, attentes ou questions..." rows={4}
                          style={{ ...inputStyle, resize: 'vertical' }}
                          onFocus={focusIn} onBlur={focusOut} />
                      </div>

                      {errorSponsor && <ErrorBlock msg={errorSponsor} />}

                      <SubmitButton loading={loadingSponsor} label="Envoyer ma demande Sponsor 💎" />

                      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
                        Notre équipe vous répondra sous 48h ouvrées.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            SECTION B — PARTENAIRES STRATÉGIQUES
        ══════════════════════════════════════════ */}
        {activeSection === 'strategique' && (
          <>
            {/* Intro */}
            <div style={{ maxWidth: 860, margin: '0 auto 64px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,204,136,0.08)', border: '1px solid rgba(0,204,136,0.2)',
                borderRadius: 100, padding: '7px 20px', marginBottom: 24,
                fontSize: 12, color: '#00cc88', fontWeight: 600,
              }}>
                🤝 Partenariat sur-mesure — contribution mixte financière &amp; en nature
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
                Devenez <span style={{ color: '#00cc88' }}>Partenaire Stratégique</span>
              </h2>
              <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 640, margin: '0 auto' }}>
                Réservé aux ports, institutions portuaires et organisations régionales qui souhaitent s'engager au-delà du sponsoring classique. Pas de tarif affiché — nous construisons ensemble votre package.
              </p>
            </div>

            {/* Partenaires confirmés */}
            <div style={{ maxWidth: 1000, margin: '0 auto 70px' }}>
              <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>
                Partenaires stratégiques confirmés
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
                {PARTENAIRES_CONFIRMES.map((p, i) => (
                  <div key={i} style={{
                    background: 'rgba(0,204,136,0.04)',
                    border: '1px solid rgba(0,204,136,0.12)',
                    borderRadius: 16, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    {/* Logo placeholder avec initiales */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(0,204,136,0.1)',
                      border: '1px solid rgba(0,204,136,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {p.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{p.nom}</div>
                      <div style={{
                        display: 'inline-block',
                        background: 'rgba(0,204,136,0.12)', border: '1px solid rgba(0,204,136,0.25)',
                        borderRadius: 100, padding: '2px 10px',
                        fontSize: 11, color: '#00cc88', fontWeight: 600,
                      }}>
                        {p.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process en 3 étapes */}
            <div style={{ maxWidth: 900, margin: '0 auto 70px' }}>
              <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>
                Comment ça marche
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
                {ETAPES_STRATEGIQUE.map((etape, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20, padding: 28,
                    position: 'relative',
                  }}>
                    {/* Connecteur entre étapes */}
                    {i < ETAPES_STRATEGIQUE.length - 1 && (
                      <div style={{
                        position: 'absolute', top: '50%', right: -12,
                        transform: 'translateY(-50%)',
                        fontSize: 18, color: 'rgba(255,255,255,0.15)',
                        display: 'none', // masqué sur mobile, visible desktop via media query impossible en inline
                      }}>→</div>
                    )}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(0,204,136,0.1)', border: '1px solid rgba(0,204,136,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, marginBottom: 16,
                    }}>
                      {etape.icon}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#00cc88', textTransform: 'uppercase', marginBottom: 8 }}>
                      Étape {etape.num}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 10 }}>
                      {etape.titre}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                      {etape.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA ou formulaire */}
            <div style={{ maxWidth: 680, margin: '0 auto' }}>

              {!showFormStrat && !submittedStrat && (
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <button
                    onClick={() => setShowFormStrat(true)}
                    style={{
                      background: 'linear-gradient(135deg, #00cc88, #009966)',
                      color: '#060a14', border: 'none', borderRadius: 14,
                      padding: '18px 40px', fontFamily: 'inherit',
                      fontWeight: 900, fontSize: 15, letterSpacing: 0.5,
                      cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,204,136,0.3)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,204,136,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,204,136,0.3)' }}
                  >
                    🏛️ Devenir Partenaire Stratégique
                  </button>
                  <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                    Notre équipe vous contacte sous 48h pour construire ensemble votre package sur-mesure.
                  </p>
                </div>
              )}

              {(showFormStrat || submittedStrat) && (
                <div style={{
                  background: '#0d1117', border: '1px solid rgba(0,204,136,0.15)',
                  borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                }}>
                  {submittedStrat ? (
                    <SuccessBlock contact={formStrat.contact} type="strategique" />
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>
                          Prise de contact
                        </h3>
                        <button onClick={() => setShowFormStrat(false)} style={{
                          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8,
                          width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                        }}>✕</button>
                      </div>

                      <div style={{
                        background: 'rgba(0,204,136,0.06)', border: '1px solid rgba(0,204,136,0.15)',
                        borderRadius: 12, padding: '14px 18px', marginBottom: 28,
                        fontSize: 13, color: '#00cc88', lineHeight: 1.7,
                      }}>
                        💬 Pas de tarif fixe. Notre équipe vous contacte sous <strong>48h</strong> pour construire ensemble votre package sur-mesure (contribution financière + apports en nature).
                      </div>

                      <form onSubmit={handleSubmitStrat}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                          <div>
                            <label style={labelStyle}>Organisation / Port *</label>
                            <input name="organisation" value={formStrat.organisation} onChange={handleChangeStrat} required
                              placeholder="Ex: Port de Lomé" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div>
                            <label style={labelStyle}>Type d'institution *</label>
                            <select name="type_institution" value={formStrat.type_institution} onChange={handleChangeStrat} required
                              style={{ ...inputStyle, cursor: 'pointer', color: formStrat.type_institution ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }}
                              onFocus={focusIn} onBlur={focusOut}
                            >
                              <option value="" disabled style={{ background: '#0d1117' }}>Sélectionner...</option>
                              {['Port / Autorité portuaire', 'Ministère / Gouvernement', 'Organisation régionale (AGPAOC, UA...)', 'Organisme de financement', 'Autre institution'].map(opt => (
                                <option key={opt} value={opt} style={{ background: '#0d1117' }}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <label style={labelStyle}>Pays *</label>
                          <input name="pays" value={formStrat.pays} onChange={handleChangeStrat} required
                            placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                          <div>
                            <label style={labelStyle}>Nom du contact *</label>
                            <input name="contact" value={formStrat.contact} onChange={handleChangeStrat} required
                              placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                          <div>
                            <label style={labelStyle}>Email *</label>
                            <input name="email" type="email" value={formStrat.email} onChange={handleChangeStrat} required
                              placeholder="votre@institution.org" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                          </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                          <label style={labelStyle}>Message / Attentes</label>
                          <textarea name="message" value={formStrat.message} onChange={handleChangeStrat}
                            placeholder="Décrivez vos attentes, vos objectifs ou les apports que vous envisagez..." rows={4}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            onFocus={focusIn} onBlur={focusOut} />
                        </div>

                        {errorStrat && <ErrorBlock msg={errorStrat} />}

                        <SubmitButton loading={loadingStrat} label="Envoyer ma demande 🏛️" color="#00cc88" />

                        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
                          Notre équipe vous contacte sous 48h ouvrées.
                        </p>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// ─── SOUS-COMPOSANTS RÉUTILISABLES ──────────────────────────────────────────

const SuccessBlock = ({ contact, option, type }) => (
  <div style={{ textAlign: 'center', padding: '32px 0' }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: type === 'strategique'
        ? 'linear-gradient(135deg, #009966, #00cc88)'
        : 'linear-gradient(135deg, #000e91, #0073f4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px', fontSize: 32,
    }}>✓</div>
    <h3 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, color: type === 'strategique' ? '#00cc88' : '#0073f4', marginBottom: 10 }}>
      Demande enregistrée !
    </h3>
    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
      Merci <strong style={{ color: '#FFFFFF' }}>{contact}</strong>.<br />
      Notre équipe vous contactera dans les <strong style={{ color: type === 'strategique' ? '#00cc88' : '#0073f4' }}>48h</strong> pour finaliser votre partenariat.
    </p>
    <div style={{
      background: type === 'strategique' ? 'rgba(0,204,136,0.07)' : 'rgba(0,115,244,0.07)',
      border: `1px solid ${type === 'strategique' ? 'rgba(0,204,136,0.15)' : 'rgba(0,115,244,0.15)'}`,
      borderRadius: 12, padding: '20px 24px', textAlign: 'left',
    }}>
      {[
        '📧 Email de confirmation envoyé',
        '📞 Appel de présentation planifié',
        '📄 Dossier de partenariat envoyé',
        '✍️ Contrat préparé selon votre choix',
      ].map((s, i) => (
        <div key={i} style={{ padding: '8px 0', fontSize: 13.5, color: 'rgba(255,255,255,0.6)', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
          {s}
        </div>
      ))}
    </div>
  </div>
)

const ErrorBlock = ({ msg }) => (
  <div style={{
    background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
    borderRadius: 10, padding: '12px 16px', marginBottom: 18,
    fontSize: 13, color: '#f87171',
  }}>
    ✕ {msg}
  </div>
)

const SubmitButton = ({ loading, label, color = '#0073f4' }) => (
  <button type="submit" disabled={loading} style={{
    width: '100%', padding: '16px',
    background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, #000e91 0%, ${color} 100%)`,
    color: '#FFFFFF', border: 'none', borderRadius: 12,
    fontFamily: 'inherit', fontWeight: 800, fontSize: 14,
    letterSpacing: 1.5, textTransform: 'uppercase',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : `0 8px 28px ${color}35`,
    transition: 'all 0.2s',
  }}>
    {loading ? '⏳ Envoi en cours…' : label}
  </button>
)

export default Partenariats