import { useState } from 'react'
import { supabase } from '../supabase'

const packages = [
  {
    id: 'platinum',
    label: 'Platinum',
    emoji: '💎',
    price: '$15,000',
    color: '#e5e4e2',
    bg: 'linear-gradient(135deg, #1a1a2e, #2d2d4e)',
    border: 'rgba(229,228,226,0.4)',
    avantages: [
      'Logo sur tous les supports officiels',
      'Stand premium 12m² (emplacement privilégié)',
      '5 badges participants inclus',
      'Prise de parole plénière (15 min)',
      'Page dédiée dans le programme',
      'Bannière digitale sur écrans principaux',
      'Base de données participants (opt-in)',
      'Mention VIP dans tous les emails',
    ]
  },
  {
    id: 'gold',
    label: 'Gold',
    emoji: '🥇',
    price: '$8,000',
    color: '#FFD700',
    bg: 'linear-gradient(135deg, #1a1a2e, #2d2d2e)',
    border: 'rgba(255,215,0,0.4)',
    avantages: [
      'Logo sur supports officiels',
      'Stand 9m²',
      '3 badges participants inclus',
      'Présentation atelier (30 min)',
      'Mention dans le programme',
      'Bannière digitale',
      'Mention dans les emails',
    ]
  },
  {
    id: 'silver',
    label: 'Silver',
    emoji: '🥈',
    price: '$4,000',
    color: '#C0C0C0',
    bg: 'linear-gradient(135deg, #1a1a2e, #1e2030)',
    border: 'rgba(192,192,192,0.4)',
    avantages: [
      'Logo sur supports officiels',
      'Stand 6m²',
      '2 badges participants inclus',
      'Mention dans le programme',
      'Bannière digitale',
    ]
  },
  {
    id: 'exposant',
    label: 'Exposant Digital',
    emoji: '💻',
    price: '$2,500',
    color: '#0073f4',
    bg: 'linear-gradient(135deg, #0a0f1e, #0d1535)',
    border: 'rgba(0,115,244,0.4)',
    avantages: [
      'Espace virtuel dédié',
      'Démonstration produit (20 min)',
      '1 badge participant inclus',
      'Fiche exposant dans le programme',
      'Profil sur le site COPAF',
    ]
  },
  {
    id: 'media',
    label: 'Partenaire Média',
    emoji: '📺',
    price: 'Sur devis',
    color: '#ff6b9d',
    bg: 'linear-gradient(135deg, #0a0f1e, #1a0d1e)',
    border: 'rgba(255,107,157,0.4)',
    avantages: [
      'Couverture médiatique officielle',
      'Accréditation presse complète',
      'Interviews exclusives',
      'Contenu co-brandé',
      'Mention partenaire média',
    ]
  },
  {
    id: 'institutionnel',
    label: 'Partenaire Institutionnel',
    emoji: '🏛️',
    price: 'Sur devis',
    color: '#00cc88',
    bg: 'linear-gradient(135deg, #0a0f1e, #0a1e14)',
    border: 'rgba(0,204,136,0.4)',
    avantages: [
      'Co-organisation possible',
      'Logo en position premium',
      'Délégation officielle accueillie',
      'Tribune institutionnelle',
      'Partenariat long terme COPAF',
    ]
  },
]

const Sponsors = () => {
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    organisation: '', contact: '', email: '', telephone: '', pays: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selected) { setErrorMsg('Veuillez sélectionner un package.'); return }
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.from('sponsors').insert([{
      package: selected,
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
        background: 'linear-gradient(135deg, #000e91 0%, #0073f4 100%)',
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px) clamp(60px, 8vw, 100px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 20, left: 40, fontSize: 80, opacity: 0.05 }}>💎</div>
        <div style={{ position: 'absolute', bottom: 20, right: 40, fontSize: 80, opacity: 0.05 }}>🤝</div>
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
          Sponsors & <span style={{ color: '#FFD700' }}>Partenaires</span>
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', opacity: 0.8, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
          Associez votre marque à la première conférence africaine sur les ports et la formation. 500+ décideurs, 25+ pays, 3 jours d'impact.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          {['500+ Participants', '25+ Pays', '3 Jours', 'Dubaï 2026'].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* PACKAGES */}
      <div style={{ padding: 'clamp(40px, 8vw, 80px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900, marginBottom: 12 }}>
            Choisissez votre <span style={{ color: '#0073f4' }}>Package</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            Cliquez sur un package pour le sélectionner, puis remplissez le formulaire ci-dessous.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 20, maxWidth: 1200, margin: '0 auto 60px'
        }}>
          {packages.map(pkg => (
            <div key={pkg.id}
              onClick={() => setSelected(pkg.id)}
              style={{
                background: selected === pkg.id ? pkg.bg : '#0d1117',
                border: `2px solid ${selected === pkg.id ? pkg.border : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 20, padding: 28, cursor: 'pointer',
                transition: 'all 0.3s',
                transform: selected === pkg.id ? 'translateY(-4px)' : 'none',
                boxShadow: selected === pkg.id ? `0 20px 40px rgba(0,0,0,0.4)` : 'none',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {selected === pkg.id && (
                <div style={{ position: 'absolute', top: 14, right: 14, background: '#0073f4', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
              )}
              <div style={{ fontSize: 36, marginBottom: 12 }}>{pkg.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: pkg.color, marginBottom: 4 }}>{pkg.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 20 }}>{pkg.price}</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />
              {pkg.avantages.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: pkg.color, flexShrink: 0, marginTop: 1 }}>✓</span>
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
                <div style={{ fontSize: 64, marginBottom: 20 }}>🤝</div>
                <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: '#0073f4' }}>Demande Envoyée !</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.8 }}>
                  Merci pour votre intérêt.<br />
                  Notre équipe vous contactera dans les <strong style={{ color: '#FFFFFF' }}>48h</strong> pour finaliser votre partenariat.
                </p>
                <div style={{ marginTop: 28, background: 'rgba(0,115,244,0.08)', border: '1px solid rgba(0,115,244,0.2)', borderRadius: 12, padding: '20px 24px', textAlign: 'left' }}>
                  {[
                    '📧 Email de confirmation envoyé',
                    '📞 Appel de présentation planifié',
                    '📄 Dossier sponsor envoyé',
                    '✍️ Contrat de partenariat préparé',
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '8px 0', fontSize: 14, color: 'rgba(255,255,255,0.6)', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>{s}</div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>
                  Formulaire de Partenariat
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                  {selected ? `Package sélectionné : ${packages.find(p => p.id === selected)?.emoji} ${packages.find(p => p.id === selected)?.label}` : 'Sélectionnez un package ci-dessus'}
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={labelStyle}>Organisation *</label>
                      <input name="organisation" value={form.organisation} onChange={handleChange} required placeholder="Nom de votre entreprise" style={inputStyle}
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
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Pays *</label>
                    <input name="pays" value={form.pays} onChange={handleChange} required placeholder="Votre pays" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#0073f4'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Message / Attentes</label>
                    <textarea name="message" value={form.message} onChange={handleChange}
                      placeholder="Décrivez vos objectifs, attentes ou questions..." rows={4}
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
                    {loading ? '⏳ Envoi...' : '🤝 Soumettre ma Demande de Partenariat'}
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

export default Sponsors