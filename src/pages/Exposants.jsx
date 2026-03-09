import { useState } from 'react'
import { supabase } from '../supabase'

const categories = [
  {
    id: 'digital',
    label: 'Solutions Digitales',
    emoji: '💻',
    color: '#0073f4',
    description: 'Logiciels portuaires, plateformes TOS, solutions cloud',
  },
  {
    id: 'ia',
    label: 'Intelligence Artificielle',
    emoji: '🤖',
    color: '#9b59b6',
    description: 'IA, Machine Learning, Computer Vision pour ports',
  },
  {
    id: 'securite',
    label: 'Sécurité & Sûreté',
    emoji: '🔒',
    color: '#e74c3c',
    description: 'Systèmes de surveillance, contrôle d\'accès, cybersécurité',
  },
  {
    id: 'energie',
    label: 'Énergie & Environnement',
    emoji: '🌱',
    color: '#00cc88',
    description: 'Solutions énergétiques, décarbonation, green port',
  },
  {
    id: 'logistique',
    label: 'Logistique & Transport',
    emoji: '🚢',
    color: '#FFD700',
    description: 'Équipements portuaires, manutention, tracking',
  },
  {
    id: 'formation',
    label: 'Formation & Conseil',
    emoji: '🎓',
    color: '#ff6b9d',
    description: 'Organismes de formation, cabinets conseil, certifications',
  },
]

const forfaits = [
  {
    id: 'standard',
    label: 'Stand Standard',
    emoji: '🏪',
    price: '$1,500',
    color: '#0073f4',
    avantages: [
      'Espace 4m² aménagé',
      '1 badge exposant inclus',
      'Table + 2 chaises',
      'Prise électrique',
      'Wifi haut débit',
      'Fiche dans le programme',
    ]
  },
  {
    id: 'premium',
    label: 'Stand Premium',
    emoji: '⭐',
    price: '$3,000',
    color: '#FFD700',
    avantages: [
      'Espace 9m² aménagé',
      '2 badges exposants inclus',
      'Mobilier premium',
      'Écran LED 55"',
      'Emplacement privilégié',
      'Démonstration produit (20 min)',
      'Fiche dédiée dans programme',
      'Logo sur supports',
    ]
  },
  {
    id: 'virtuel',
    label: 'Exposant Virtuel',
    emoji: '🌐',
    price: '$500',
    color: '#00cc88',
    avantages: [
      'Profil digital sur le site',
      'Présentation vidéo (5 min)',
      'Fiche produit en ligne',
      'QR code dédié',
      '1 accès webinaire COPAF',
    ]
  },
]

const Exposants = () => {
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedForfait, setSelectedForfait] = useState(null)
  const [form, setForm] = useState({
    entreprise: '', contact: '', email: '', telephone: '',
    pays: '', site: '', description: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedCat) { setErrorMsg('Veuillez sélectionner une catégorie.'); return }
    if (!selectedForfait) { setErrorMsg('Veuillez sélectionner un forfait.'); return }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.from('exposants').insert([{
      categorie: selectedCat,
      forfait: selectedForfait,
      entreprise: form.entreprise,
      contact: form.contact,
      email: form.email,
      telephone: form.telephone,
      pays: form.pays,
      site: form.site,
      description: form.description,
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
    borderRadius: 8, color: '#FFFFFF',
    fontFamily: 'Roboto, sans-serif', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', marginBottom: 8
  }

  return (
    <div style={{ background: '#060a14', minHeight: '100vh', fontFamily: 'Roboto, sans-serif', color: '#FFFFFF' }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0f1e 0%, #000e91 50%, #0073f4 100%)',
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 40, fontSize: 80, opacity: 0.05 }}>🚢</div>
        <div style={{ position: 'absolute', bottom: 20, right: 40, fontSize: 80, opacity: 0.05 }}>💻</div>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 100, padding: '6px 22px', marginBottom: 20
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            COPAF 2026 · Dubaï
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
          Espace <span style={{ color: '#0073f4' }}>Exposants</span>
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', opacity: 0.8, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
          Présentez vos solutions aux décideurs portuaires africains. Une vitrine exceptionnelle pour vos produits et services.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          {['500+ Visiteurs qualifiés', '25+ Pays', '3 Jours d\'exposition', 'Dubaï 2026'].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>{s}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>

        {/* CATÉGORIES */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, marginBottom: 12 }}>
            Votre <span style={{ color: '#0073f4' }}>Secteur d'Activité</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>Sélectionnez la catégorie qui correspond à vos produits/services</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 16, maxWidth: 1100, margin: '0 auto 60px'
        }}>
          {categories.map(cat => (
            <div key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                background: selectedCat === cat.id ? `rgba(${cat.id === 'digital' ? '0,115,244' : cat.id === 'ia' ? '155,89,182' : cat.id === 'securite' ? '231,76,60' : cat.id === 'energie' ? '0,204,136' : cat.id === 'logistique' ? '255,215,0' : '255,107,157'},0.12)` : '#0d1117',
                border: `2px solid ${selectedCat === cat.id ? cat.color : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, padding: '20px 16px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.3s',
                transform: selectedCat === cat.id ? 'translateY(-3px)' : 'none',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{cat.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedCat === cat.id ? cat.color : '#FFFFFF', marginBottom: 6 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{cat.description}</div>
            </div>
          ))}
        </div>

        {/* FORFAITS */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, marginBottom: 12 }}>
            Choisissez votre <span style={{ color: '#0073f4' }}>Forfait</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20, maxWidth: 1000, margin: '0 auto 60px'
        }}>
          {forfaits.map(f => (
            <div key={f.id}
              onClick={() => setSelectedForfait(f.id)}
              style={{
                background: selectedForfait === f.id ? '#0d1535' : '#0d1117',
                border: `2px solid ${selectedForfait === f.id ? f.color : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 20, padding: 28, cursor: 'pointer',
                transition: 'all 0.3s',
                transform: selectedForfait === f.id ? 'translateY(-4px)' : 'none',
                position: 'relative'
              }}
            >
              {selectedForfait === f.id && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: f.color, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
              )}
              <div style={{ fontSize: 36, marginBottom: 10 }}>{f.emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: f.color, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>{f.price}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />
              {f.avantages.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: f.color, flexShrink: 0 }}>✓</span>
                  {a}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* FORMULAIRE */}
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)' }}>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: '#0073f4' }}>Demande Enregistrée !</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.8 }}>
                  Merci pour votre intérêt.<br />
                  Notre équipe vous contactera dans les <strong style={{ color: '#FFFFFF' }}>48h</strong> pour confirmer votre espace exposant.
                </p>
                <div style={{ marginTop: 28, background: 'rgba(0,115,244,0.08)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 12, padding: '20px 24px', textAlign: 'left' }}>
                  {[
                    '📧 Email de confirmation envoyé',
                    '📋 Dossier exposant envoyé',
                    '📐 Plan de salle et emplacement partagé',
                    '✍️ Contrat d\'exposition préparé',
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '8px 0', fontSize: 14, color: 'rgba(255,255,255,0.6)', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>{s}</div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>
                  Formulaire Exposant
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                  {selectedForfait ? `Forfait : ${forfaits.find(f => f.id === selectedForfait)?.emoji} ${forfaits.find(f => f.id === selectedForfait)?.label}` : 'Sélectionnez un forfait ci-dessus'}
                  {selectedCat ? ` · ${categories.find(c => c.id === selectedCat)?.emoji} ${categories.find(c => c.id === selectedCat)?.label}` : ''}
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Entreprise *</label>
                      <input name="entreprise" value={form.entreprise} onChange={handleChange} required placeholder="Nom de votre entreprise" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Contact *</label>
                      <input name="contact" value={form.contact} onChange={handleChange} required placeholder="Nom & Prénom" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="votre@email.com" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="+229 01 XX XX XX" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Pays *</label>
                      <input name="pays" value={form.pays} onChange={handleChange} required placeholder="Votre pays" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Site Web</label>
                      <input name="site" value={form.site} onChange={handleChange} placeholder="www.votresite.com" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = '#0073f4'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Description de vos produits/services *</label>
                    <textarea name="description" value={form.description} onChange={handleChange} required
                      placeholder="Décrivez brièvement vos produits ou services..." rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#0073f4'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Message / Besoins spécifiques</label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Besoins particuliers, questions..." rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#0073f4'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>

                  {errorMsg && (
                    <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#ff6b6b' }}>
                      ❌ {errorMsg}
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '16px',
                    background: loading ? 'rgba(0,115,244,0.4)' : 'linear-gradient(135deg, #000e91, #0073f4)',
                    color: '#FFFFFF', border: 'none', borderRadius: 10,
                    fontFamily: 'Roboto', fontWeight: 700, fontSize: 14,
                    letterSpacing: 2, textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(0,115,244,0.3)'
                  }}>
                    {loading ? '⏳ Envoi...' : '🚀 Soumettre ma Demande Exposant'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exposants