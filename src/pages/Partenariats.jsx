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
    id: 'platine', label: 'Platine', price: '20 000 €', color: '#e8e0d0', accent: 'rgba(232,224,208,0.12)', badge: '👑 Niveau supérieur',
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
    id: 'or', label: 'Or', price: '16 000 €', color: '#FFD700', accent: 'rgba(255,215,0,0.10)', badge: '⭐ Très populaire',
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
    id: 'argent', label: 'Argent', price: '10 000 €', color: '#C0C0C0', accent: 'rgba(192,192,192,0.08)',
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
    id: 'bronze', label: 'Bronze', price: '8 000 €', color: '#cd7f32', accent: 'rgba(205,127,50,0.08)',
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
    price: '30 000 €', color: '#00cc88', accent: 'rgba(0,204,136,0.12)', badge: '🌟 Niveau premium',
    desc: 'Le niveau d\'engagement le plus élevé. Vous co-portez l\'événement avec COPAF.',
    avantages: [
      'Membre officiel du comité d\'organisation COPAF 2026',
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
    price: '20 000 €', color: '#7ab8ff', accent: 'rgba(122,184,255,0.10)', badge: '🤝 Partenariat associé',
    desc: 'S\'associer officiellement à la COPAF 2026 avec une forte visibilité.',
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="7" fill={color} fillOpacity="0.15" />
    <polyline points="3.5 7 5.5 9.5 10.5 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ErrorBlock = ({ msg }) => (
  <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#f87171' }}>
    ✕ {msg}
  </div>
)

const SubmitButton = ({ loading, label, color = '#0073f4' }) => (
  <button type="submit" disabled={loading} style={{
    width: '100%', padding: '16px',
    background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, #000e91 0%, ${color} 100%)`,
    color: '#FFFFFF', border: 'none', borderRadius: 12, fontFamily: 'inherit',
    fontWeight: 800, fontSize: 14, letterSpacing: 1.5, textTransform: 'uppercase',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : `0 8px 28px ${color}35`, transition: 'all 0.2s',
  }}>
    {loading ? '⏳ Envoi en cours…' : label}
  </button>
)

const SuccessBlock = ({ contact, type }) => (
  <div style={{ textAlign: 'center', padding: '32px 0' }}>
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: type === 'strategique' ? 'linear-gradient(135deg, #009966, #00cc88)' : 'linear-gradient(135deg, #000e91, #0073f4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32,
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
      {['📧 Email de confirmation envoyé', '📞 Appel de présentation planifié', '📄 Dossier de partenariat envoyé', '✍️ Contrat préparé selon votre choix'].map((s, i) => (
        <div key={i} style={{ padding: '8px 0', fontSize: 13.5, color: 'rgba(255,255,255,0.6)', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>{s}</div>
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
    if (type === 'strategique' || type === 'sponsor') { setActiveSection(type); setSelectedOption(null) }
  }, [location.search])

  const handleSectionChange = (id) => { setActiveSection(id); setSelectedOption(null); setErrorSponsor(''); setErrorStrat('') }

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

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#FFFFFF', fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }
  const focusIn = e => { e.target.style.borderColor = '#0073f4'; e.target.style.background = 'rgba(0,115,244,0.05)' }
  const focusOut = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.04)' }

  const selectedSponsor = SPONSORS.find(s => s.id === selectedOption)
  const selectedStrat = PARTENAIRES_STRATEGIQUES.find(p => p.id === selectedOption)

  const renderCards = (items, accentFn) => items.map(item => (
    <div key={item.id} onClick={() => setSelectedOption(item.id)} style={{
      background: selectedOption === item.id ? item.accent : 'rgba(255,255,255,0.02)',
      border: `2px solid ${selectedOption === item.id ? item.color : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 20, padding: 28, cursor: 'pointer', transition: 'all 0.25s',
      transform: selectedOption === item.id ? 'translateY(-6px)' : 'none', position: 'relative',
      boxShadow: selectedOption === item.id ? `0 16px 40px ${item.color}22` : 'none',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: item.color, borderRadius: '20px 20px 0 0', opacity: selectedOption === item.id ? 1 : 0.4 }} />
      {selectedOption === item.id && (
        <div style={{ position: 'absolute', top: 16, right: 16, background: item.color, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#060a14', fontWeight: 900 }}>✓</div>
      )}
      {item.badge && (
        <div style={{ display: 'inline-block', background: `${item.color}22`, border: `1px solid ${item.color}44`, borderRadius: 100, padding: '3px 12px', fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12 }}>
          {item.badge}
        </div>
      )}
      <div style={{ fontSize: 13, fontWeight: 800, color: item.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, marginTop: item.badge ? 0 : 12 }}>
        {item.label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#FFFFFF', marginBottom: 6, letterSpacing: '-0.02em' }}>{item.price}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: item.desc ? 8 : 22 }}>participation unique</div>
      {item.desc && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 22, lineHeight: 1.6 }}>{item.desc}</div>}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />
      {item.avantages.map((a, i) => (
        <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0, marginTop: 2 }}><CheckIcon color={item.color} /></span>
          {a}
        </div>
      ))}
    </div>
  ))

  return (
    <div style={{ background: '#060a14', minHeight: '100vh', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#FFFFFF' }}>
      <Navbar />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(160deg, #060a14 0%, #000e91 60%, #0073f4 100%)', padding: 'clamp(90px, 14vw, 150px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,115,244,0.08)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '7px 22px', marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0073f4' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>COPAF 2026 · Maroc</span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 58px)', fontWeight: 900, marginBottom: 18, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Sponsors &amp; <span style={{ color: '#0073f4' }}>Partenaires</span>
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(255,255,255,0.65)', maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
          Associez votre organisation à la première conférence africaine sur les ports et la logistique maritime.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
          {['500+ Participants', '25+ Pays', '3 Jours', 'Maroc 2026'].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600 }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: 'clamp(50px, 8vw, 90px) clamp(20px, 5vw, 60px)' }}>

        {/* SÉLECTEUR */}
        <div style={{ maxWidth: 600, margin: '0 auto 60px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
            Choisissez votre type de partenariat
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 8 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => handleSectionChange(s.id)} style={{ background: activeSection === s.id ? '#0073f4' : 'transparent', border: 'none', borderRadius: 10, padding: '18px 14px', cursor: 'pointer', transition: 'all 0.25s', color: '#FFFFFF', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: activeSection === s.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', marginTop: 4, lineHeight: 1.4 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION SPONSORS ── */}
        {activeSection === 'sponsor' && (
          <>
            <div style={{ maxWidth: 1200, margin: '0 auto 70px' }}>
              <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
                Choisissez votre <span style={{ color: '#0073f4' }}>niveau de sponsoring</span>
              </h2>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36 }}>
                Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire ci-dessous
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                {SPONSORS.map(s => (
                  <div key={s.id} onClick={() => setSelectedOption(s.id)} style={{ background: selectedOption === s.id ? s.accent : 'rgba(255,255,255,0.03)', border: `1.5px solid ${selectedOption === s.id ? s.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '6px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: selectedOption === s.id ? s.color : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                    {s.label} — {s.price}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
                {renderCards(SPONSORS)}
              </div>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
                {submittedSponsor ? <SuccessBlock contact={formSponsor.contact} type="sponsor" /> : (
                  <>
                    <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: 'center' }}>Formulaire de demande Sponsor</h3>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                      {selectedOption ? <>Niveau sélectionné : <strong style={{ color: '#0073f4' }}>Sponsor {selectedSponsor?.label} — {selectedSponsor?.price}</strong></> : <span style={{ color: '#f87171' }}>⚠️ Sélectionnez un niveau ci-dessus</span>}
                    </p>
                    <form onSubmit={handleSubmitSponsor}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div><label style={labelStyle}>Organisation *</label><input name="organisation" value={formSponsor.organisation} onChange={handleChangeSponsor} required placeholder="Votre organisation" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                        <div><label style={labelStyle}>Nom du contact *</label><input name="contact" value={formSponsor.contact} onChange={handleChangeSponsor} required placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div><label style={labelStyle}>Email *</label><input name="email" type="email" value={formSponsor.email} onChange={handleChangeSponsor} required placeholder="votre@email.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                        <div><label style={labelStyle}>Téléphone</label><input name="telephone" value={formSponsor.telephone} onChange={handleChangeSponsor} placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      </div>
                      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Pays *</label><input name="pays" value={formSponsor.pays} onChange={handleChangeSponsor} required placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      <div style={{ marginBottom: 24 }}><label style={labelStyle}>Message / Attentes</label><textarea name="message" value={formSponsor.message} onChange={handleChangeSponsor} placeholder="Vos objectifs, attentes ou questions..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} /></div>
                      {errorSponsor && <ErrorBlock msg={errorSponsor} />}
                      <SubmitButton loading={loadingSponsor} label="Envoyer ma demande Sponsor 💎" />
                      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>Notre équipe vous répondra sous 48h ouvrées.</p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── SECTION PARTENAIRES STRATÉGIQUES ── */}
        {activeSection === 'strategique' && (
          <>
            <div style={{ maxWidth: 900, margin: '0 auto 70px' }}>
              <h2 style={{ textAlign: 'center', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 900, marginBottom: 10 }}>
                Choisissez votre <span style={{ color: '#00cc88' }}>niveau de partenariat</span>
              </h2>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 36 }}>
                Cliquez sur un niveau pour le sélectionner, puis remplissez le formulaire ci-dessous
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                {PARTENAIRES_STRATEGIQUES.map(p => (
                  <div key={p.id} onClick={() => setSelectedOption(p.id)} style={{ background: selectedOption === p.id ? p.accent : 'rgba(255,255,255,0.03)', border: `1.5px solid ${selectedOption === p.id ? p.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 100, padding: '6px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: selectedOption === p.id ? p.color : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                    {p.short} — {p.price}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 20 }}>
                {renderCards(PARTENAIRES_STRATEGIQUES)}
              </div>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{ background: '#0d1117', border: '1px solid rgba(0,204,136,0.12)', borderRadius: 24, padding: 'clamp(28px, 5vw, 48px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
                {submittedStrat ? <SuccessBlock contact={formStrat.contact} type="strategique" /> : (
                  <>
                    <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: 'center' }}>Formulaire de demande Partenariat</h3>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                      {selectedOption ? <>Niveau sélectionné : <strong style={{ color: '#00cc88' }}>{selectedStrat?.label} — {selectedStrat?.price}</strong></> : <span style={{ color: '#f87171' }}>⚠️ Sélectionnez un niveau ci-dessus</span>}
                    </p>
                    <form onSubmit={handleSubmitStrat}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div><label style={labelStyle}>Organisation / Port *</label><input name="organisation" value={formStrat.organisation} onChange={handleChangeStrat} required placeholder="Ex : Port de Lomé" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                        <div>
                          <label style={labelStyle}>Type d'institution *</label>
                          <select name="type_institution" value={formStrat.type_institution} onChange={handleChangeStrat} required style={{ ...inputStyle, cursor: 'pointer', color: formStrat.type_institution ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }} onFocus={focusIn} onBlur={focusOut}>
                            <option value="" disabled style={{ background: '#0d1117' }}>Sélectionner...</option>
                            {['Port / Autorité portuaire', 'Ministère / Gouvernement', 'Organisation régionale (AGPAOC, UA...)', 'Organisme de financement', 'Autre institution'].map(opt => (
                              <option key={opt} value={opt} style={{ background: '#0d1117' }}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Pays *</label><input name="pays" value={formStrat.pays} onChange={handleChangeStrat} required placeholder="Votre pays" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginBottom: 14 }}>
                        <div><label style={labelStyle}>Nom du contact *</label><input name="contact" value={formStrat.contact} onChange={handleChangeStrat} required placeholder="Prénom Nom" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                        <div><label style={labelStyle}>Email *</label><input name="email" type="email" value={formStrat.email} onChange={handleChangeStrat} required placeholder="votre@institution.org" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      </div>
                      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Téléphone</label><input name="telephone" value={formStrat.telephone} onChange={handleChangeStrat} placeholder="+212 6XX XXX XXX" style={inputStyle} onFocus={focusIn} onBlur={focusOut} /></div>
                      <div style={{ marginBottom: 24 }}><label style={labelStyle}>Message / Attentes</label><textarea name="message" value={formStrat.message} onChange={handleChangeStrat} placeholder="Décrivez vos attentes, vos objectifs..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} /></div>
                      {errorStrat && <ErrorBlock msg={errorStrat} />}
                      <SubmitButton loading={loadingStrat} label="Envoyer ma demande 🏛️" color="#00cc88" />
                      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>Notre équipe vous répondra sous 48h ouvrées.</p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Partenariats