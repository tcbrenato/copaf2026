import { useState } from 'react'

const Inscription = () => {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    organisation: '', poste: '', pays: '', participants: '1', message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#FFFFFF',
    border: '1.5px solid rgba(0,14,145,0.15)',
    borderRadius: 8, color: '#222',
    fontFamily: 'Roboto, sans-serif', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#666', marginBottom: 8
  }

  return (
    <section id="inscription" style={{
      padding: '100px 60px',
      background: '#f8f9ff',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,115,244,0.08)',
          border: '1px solid rgba(0,115,244,0.25)',
          borderRadius: 100, padding: '6px 22px', marginBottom: 18
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Rejoindre la COPAF 2026
          </span>
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
          color: '#000e91', marginBottom: 16, lineHeight: 1.15
        }}>
          Inscription & <span style={{ color: '#0073f4' }}>Paiement</span>
        </h2>
        <p style={{ fontSize: 17, color: '#666', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
          Réservez votre place dès maintenant. Paiement sécurisé par virement bancaire.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, maxWidth: 1100, margin: '0 auto' }}>

        {/* FORMULAIRE */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,115,244,0.1)',
          borderRadius: 20, padding: 48,
          boxShadow: '0 4px 40px rgba(0,14,145,0.06)'
        }}>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(0,115,244,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, margin: '0 auto 24px'
              }}>
                ✅
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#000e91', marginBottom: 12 }}>
                Inscription Reçue !
              </h3>
              <p style={{ fontSize: 16, color: '#666', lineHeight: 1.8, marginBottom: 28 }}>
                Merci <strong style={{ color: '#000e91' }}>{form.prenom} {form.nom}</strong>.<br />
                Vous recevrez les instructions de virement à<br />
                <strong style={{ color: '#0073f4' }}>{form.email}</strong> dans les 24h.
              </p>
              <div style={{
                background: '#f8f9ff',
                border: '1px solid rgba(0,115,244,0.15)',
                borderRadius: 12, padding: '24px 28px', textAlign: 'left'
              }}>
                <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                  Prochaines étapes
                </div>
                {[
                  '📧 Email de confirmation envoyé',
                  '🏦 Instructions de virement bancaire reçues',
                  '✈️ Informations logistiques Dubaï partagées',
                  '📱 Accès à l\'espace participant COPAF 2026',
                ].map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: i < 3 ? '1px solid rgba(0,115,244,0.07)' : 'none',
                    fontSize: 14, color: '#444'
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#000e91', marginBottom: 32 }}>
                Formulaire d'Inscription
              </h3>

              {/* Nom & Prénom */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange} required
                    placeholder="Votre nom" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} required
                    placeholder="Votre prénom" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
              </div>

              {/* Email & Téléphone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="votre@email.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input name="telephone" value={form.telephone} onChange={handleChange} required
                    placeholder="+229 01 XX XX XX" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
              </div>

              {/* Organisation & Poste */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Organisation *</label>
                  <input name="organisation" value={form.organisation} onChange={handleChange} required
                    placeholder="Votre port / entreprise" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Poste *</label>
                  <input name="poste" value={form.poste} onChange={handleChange} required
                    placeholder="Votre fonction" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
              </div>

              {/* Pays & Participants */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Pays *</label>
                  <input name="pays" value={form.pays} onChange={handleChange} required
                    placeholder="Votre pays" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nombre de participants</label>
                  <select name="participants" value={form.participants} onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>
                        {n} participant{n > 1 ? 's' : ''} — ${(n * 5000).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Message / Besoins spécifiques</label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  placeholder="Questions, besoins alimentaires, accessibilité..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#0073f4'}
                  onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'}
                />
              </div>

              {/* Total */}
              <div style={{
                background: 'linear-gradient(135deg, #000e91 0%, #0073f4 100%)',
                borderRadius: 12, padding: '18px 24px', marginBottom: 24,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2 }}>
                    Total à régler
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                    {form.participants} participant{form.participants > 1 ? 's' : ''} × $5,000
                  </div>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF' }}>
                  ${(parseInt(form.participants) * 5000).toLocaleString()}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%',
                background: loading ? 'rgba(0,115,244,0.5)' : '#0073f4',
                color: '#FFFFFF', border: 'none', padding: '16px',
                borderRadius: 10, fontFamily: 'Roboto', fontWeight: 700,
                fontSize: 14, letterSpacing: 2, textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(0,115,244,0.3)'
              }}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#005fd4' }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#0073f4' }}
              >
                {loading ? '⏳ Envoi en cours...' : '✈️ Confirmer mon Inscription'}
              </button>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Prix */}
          <div style={{
            background: '#000e91',
            borderRadius: 16, padding: 32,
            boxShadow: '0 8px 40px rgba(0,14,145,0.2)'
          }}>
            <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
              Tarif All-Inclusive
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
              $5,000
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 24 }}>
              par participant
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />
            {[
              'Frais de formation (3 jours)',
              'Pauses-café',
              'Matériels didactiques',
              'Tablette préchargée',
              '2 Certifications internationales',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '7px 0',
                borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                fontSize: 13, color: 'rgba(255,255,255,0.8)'
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#0073f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, flexShrink: 0
                }}>✓</span>
                {item}
              </div>
            ))}
          </div>

          {/* Virement */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,115,244,0.12)',
            borderRadius: 16, padding: 28,
            boxShadow: '0 2px 20px rgba(0,14,145,0.05)'
          }}>
            <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
              🏦 Paiement par Virement
            </div>
            <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
              Après validation, vous recevrez par email les coordonnées bancaires complètes.
            </p>
            {[
              { label: 'Bénéficiaire', value: 'CRF PERFECTION' },
              { label: 'Référence', value: 'COPAF2026 + Nom' },
              { label: 'Délai paiement', value: '7 jours après inscription' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < 2 ? '1px solid rgba(0,115,244,0.07)' : 'none'
              }}>
                <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#000e91' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,115,244,0.12)',
            borderRadius: 16, padding: 28,
            boxShadow: '0 2px 20px rgba(0,14,145,0.05)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#000e91', marginBottom: 16 }}>
              📞 Besoin d'aide ?
            </div>
            {[
              { icon: '📱', value: '+229 01 97 77 57 98' },
              { icon: '🇺🇸', value: '+1 (240) 978-4155' },
              { icon: '✉️', value: 'contact@crfperfection.pro' },
              { icon: '🌐', value: 'www.crfperfection.pro' },
            ].map((c, i) => (
              <div key={i} style={{
                fontSize: 13, color: '#555', padding: '7px 0',
                display: 'flex', gap: 10, alignItems: 'center',
                borderBottom: i < 3 ? '1px solid rgba(0,115,244,0.06)' : 'none'
              }}>
                <span>{c.icon}</span> {c.value}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Inscription