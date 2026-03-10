import { useState } from 'react'
import { supabase } from '../supabase'
import ReactGA from 'react-ga4'
import emailjs from '@emailjs/browser'

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw_ofmnS-UcXLs6fGQrIIjEePHoODn6_pppidhmCuKSjOThwGhn9rx1ZUIU7JKlkkoo/exec'

const Inscription = () => {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    organisation: '', poste: '', pays: '', participants: '1', message: ''
  })
  const [paiementMode, setPaiementMode] = useState('maintenant') // 'maintenant' | 'plus_tard'
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [dossierNum, setDossierNum] = useState('')

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
    const montant = parseInt(form.participants) * 5000

    // ── SUPABASE ──
    const { error } = await supabase
      .from('inscriptions')
      .insert([{
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        organisation: form.organisation,
        poste: form.poste,
        pays: form.pays,
        participants: parseInt(form.participants),
        montant,
        message: form.message,
        paiement_status: paiementMode === 'maintenant' ? 'en_attente' : 'reserve',
        dossier,
      }])

    if (error) {
      setLoading(false)
      setErrorMsg('Une erreur est survenue : ' + error.message)
      return
    }

    // ── GOOGLE SHEETS ──
    try {
      await fetch(SHEET_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant, dossier, paiement: paiementMode })
      })
    } catch (err) { console.log('Sheets:', err) }

    // ── EMAILJS ──
    try {
      await emailjs.send(
        'service_x07g4et',
        'template_7wrkmm1',
        {
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          organisation: form.organisation,
          poste: form.poste,
          pays: form.pays,
          participants: form.participants,
          montant: montant.toLocaleString(),
          dossier,
          paiement_mode: paiementMode === 'maintenant' ? 'Paiement immédiat (7 jours)' : 'Réservation — paiement différé',
        },
        'zBZAZxCfznICTKLJK'
      )
    } catch (err) { console.log('EmailJS:', err) }

    // ── ANALYTICS ──
    ReactGA.event({ category: 'Inscription', action: 'form_submit', label: form.pays, value: parseInt(form.participants) })

    setDossierNum(dossier)
    setLoading(false)
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: 'clamp(10px, 2vw, 13px) 16px',
    background: '#FFFFFF', border: '1.5px solid rgba(0,14,145,0.15)',
    borderRadius: 8, color: '#222', fontFamily: 'Roboto, sans-serif',
    fontSize: 'clamp(13px, 1.8vw, 14px)', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: '#666', marginBottom: 8
  }

  return (
    <section id="inscription" style={{
      padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px)',
      background: '#f8f9ff', fontFamily: 'Roboto, sans-serif',
    }}>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 64px)' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(0,115,244,0.08)',
          border: '1px solid rgba(0,115,244,0.25)', borderRadius: 100, padding: '6px 22px', marginBottom: 18
        }}>
          <span style={{ color: '#0073f4', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>
            Rejoindre la COPAF 2026
          </span>
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: '#000e91', marginBottom: 16, lineHeight: 1.15 }}>
          Inscription & <span style={{ color: '#0073f4' }}>Paiement</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#666', maxWidth: 560, margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
          Réservez votre place dès maintenant. Paiement sécurisé par virement bancaire.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: 'clamp(20px, 4vw, 40px)', maxWidth: 1100, margin: '0 auto', alignItems: 'start',
      }}>

        {/* FORMULAIRE */}
        <div style={{
          background: '#FFFFFF', border: '1px solid rgba(0,115,244,0.1)',
          borderRadius: 20, padding: 'clamp(24px, 5vw, 48px)',
          boxShadow: '0 4px 40px rgba(0,14,145,0.06)', minWidth: 0,
        }}>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: 'clamp(24px, 5vw, 48px) 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: paiementMode === 'maintenant' ? 'rgba(0,115,244,0.1)' : 'rgba(0,200,100,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, margin: '0 auto 24px'
              }}>
                {paiementMode === 'maintenant' ? '✅' : '🎫'}
              </div>

              <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 900, color: '#000e91', marginBottom: 12 }}>
                {paiementMode === 'maintenant' ? 'Inscription Confirmée !' : 'Place Réservée !'}
              </h3>

              {/* Numéro de dossier */}
              <div style={{
                background: 'linear-gradient(135deg, #000e91, #0073f4)',
                borderRadius: 12, padding: '16px 24px', marginBottom: 24,
                display: 'inline-block'
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                  Numéro de dossier
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', letterSpacing: 2 }}>
                  {dossierNum}
                </div>
              </div>

              <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#666', lineHeight: 1.8, marginBottom: 28 }}>
                Merci <strong style={{ color: '#000e91' }}>{form.prenom} {form.nom}</strong>.<br />
                {paiementMode === 'maintenant'
                  ? <>Vous recevrez les instructions de virement à <strong style={{ color: '#0073f4' }}>{form.email}</strong> dans les 24h.</>
                  : <>Votre place est réservée. Vous pouvez régler avant le <strong style={{ color: '#0073f4' }}>1er Août 2026</strong>.</>
                }
              </p>

              {/* Étapes selon mode */}
              <div style={{
                background: '#f8f9ff', border: '1px solid rgba(0,115,244,0.15)',
                borderRadius: 12, padding: 'clamp(16px, 3vw, 24px)', textAlign: 'left', marginBottom: 20
              }}>
                <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                  Prochaines étapes
                </div>
                {(paiementMode === 'maintenant' ? [
                  '📧 Email de confirmation envoyé',
                  '🏦 Instructions de virement reçues sous 24h',
                  '💳 Règlement sous 7 jours ouvrés',
                  '🎫 Badge & accès participant envoyés après paiement',
                  '✈️ Informations logistiques Dubaï partagées',
                ] : [
                  '📧 Email de confirmation de réservation envoyé',
                  '📅 Rappel de paiement à J+3, J+7, J+14',
                  '🏦 Instructions de virement disponibles sur demande',
                  '🎫 Badge & accès participant envoyés après paiement',
                  '✈️ Informations logistiques Dubaï partagées',
                ]).map((step, i, arr) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(0,115,244,0.07)' : 'none',
                    fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#444'
                  }}>{step}</div>
                ))}
              </div>

              {/* Alerte paiement différé */}
              {paiementMode === 'plus_tard' && (
                <div style={{
                  background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)',
                  borderRadius: 10, padding: '14px 18px', marginBottom: 20,
                  fontSize: 13, color: '#b37400', textAlign: 'left'
                }}>
                  ⚠️ Votre place est réservée mais <strong>non confirmée</strong> jusqu'au paiement. En cas de non-paiement avant le 1er Août 2026, votre réservation sera annulée.
                </div>
              )}
            </div>

          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 900, color: '#000e91', marginBottom: 32, textAlign: 'center' }}>
                Formulaire d'Inscription
              </h3>

              {/* Champs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} required placeholder="Votre prénom" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="votre@email.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>Téléphone *</label>
                  <input name="telephone" value={form.telephone} onChange={handleChange} required placeholder="+229 01 XX XX XX" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Organisation *</label>
                  <input name="organisation" value={form.organisation} onChange={handleChange} required placeholder="Votre port / entreprise" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>Poste *</label>
                  <input name="poste" value={form.poste} onChange={handleChange} required placeholder="Votre fonction" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Pays *</label>
                  <input name="pays" value={form.pays} onChange={handleChange} required placeholder="Votre pays" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
                </div>
                <div>
                  <label style={labelStyle}>Nombre de participants</label>
                  <select name="participants" value={form.participants} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} participant{n > 1 ? 's' : ''} — ${(n * 5000).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Message / Besoins spécifiques</label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  placeholder="Questions, besoins alimentaires, accessibilité..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#0073f4'} onBlur={e => e.target.style.borderColor = 'rgba(0,14,145,0.15)'} />
              </div>

              {/* CHOIX PAIEMENT */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Mode de paiement *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { value: 'maintenant', icon: '💳', title: 'Payer maintenant', desc: 'Instructions de virement sous 24h' },
                    { value: 'plus_tard', icon: '📅', title: 'Réserver ma place', desc: 'Payer avant le 1er Août 2026' },
                  ].map(opt => (
                    <div key={opt.value}
                      onClick={() => setPaiementMode(opt.value)}
                      style={{
                        border: `2px solid ${paiementMode === opt.value ? '#0073f4' : 'rgba(0,14,145,0.15)'}`,
                        borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
                        background: paiementMode === opt.value ? 'rgba(0,115,244,0.05)' : '#FFFFFF',
                        transition: 'all 0.2s', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: paiementMode === opt.value ? '#0073f4' : '#000e91', marginBottom: 4 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)',
                  borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#cc3333'
                }}>❌ {errorMsg}</div>
              )}

              {/* TOTAL */}
              <div style={{
                background: 'linear-gradient(135deg, #000e91 0%, #0073f4 100%)',
                borderRadius: 12, padding: 'clamp(14px, 3vw, 18px) clamp(16px, 3.5vw, 24px)',
                marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 12, flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2 }}>
                    {paiementMode === 'maintenant' ? 'Total à régler' : 'Montant à réserver'}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                    {form.participants} participant{form.participants > 1 ? 's' : ''} × $5,000
                  </div>
                </div>
                <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF' }}>
                  ${(parseInt(form.participants) * 5000).toLocaleString()}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%',
                background: loading ? 'rgba(0,115,244,0.5)' : paiementMode === 'maintenant' ? '#0073f4' : '#000e91',
                color: '#FFFFFF', border: 'none', padding: '16px', borderRadius: 10,
                fontFamily: 'Roboto', fontWeight: 700, fontSize: 'clamp(12px, 1.8vw, 14px)',
                letterSpacing: 2, textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(0,115,244,0.3)'
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1' }}
              >
                {loading ? '⏳ Envoi en cours...' : paiementMode === 'maintenant' ? '💳 Confirmer & Payer' : '🎫 Réserver ma Place'}
              </button>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 3vw, 20px)', minWidth: 0 }}>
          <div style={{ background: '#000e91', borderRadius: 16, padding: 'clamp(24px, 4vw, 32px)', boxShadow: '0 8px 40px rgba(0,14,145,0.2)' }}>
            <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
              Tarif All-Inclusive
            </div>
            <div style={{ fontSize: 'clamp(40px, 7vw, 52px)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, textAlign: 'center' }}>$5,000</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 24, textAlign: 'center' }}>par participant</div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />
            {['Frais de formation (3 jours)', 'Hébergement inclus', 'Pauses-café & déjeuners', 'Matériels didactiques', 'Tablette préchargée', '2 Certifications internationales', 'Transferts aéroport-hôtel', 'Service conciergerie VIP'].map((item, i, arr) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                fontSize: 'clamp(12px, 1.8vw, 13px)', color: 'rgba(255,255,255,0.8)'
              }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#0073f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,115,244,0.12)', borderRadius: 16, padding: 'clamp(20px, 3.5vw, 28px)', boxShadow: '0 2px 20px rgba(0,14,145,0.05)' }}>
            <div style={{ fontSize: 11, color: '#0073f4', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
              🏦 Paiement par Virement
            </div>
            <p style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#666', lineHeight: 1.7, marginBottom: 16, textAlign: 'center' }}>
              Après validation, vous recevrez par email les coordonnées bancaires complètes.
            </p>
            {[
              { label: 'Bénéficiaire', value: 'CRF PERFECTION' },
              { label: 'Référence', value: 'COPAF2026 + Nom' },
              { label: 'Délai paiement', value: '7 jours après inscription' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 8, flexWrap: 'wrap', padding: '10px 0',
                borderBottom: i < 2 ? '1px solid rgba(0,115,244,0.07)' : 'none'
              }}>
                <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</span>
                <span style={{ fontSize: 'clamp(12px, 1.8vw, 13px)', fontWeight: 700, color: '#000e91' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,115,244,0.12)', borderRadius: 16, padding: 'clamp(20px, 3.5vw, 28px)', boxShadow: '0 2px 20px rgba(0,14,145,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#000e91', marginBottom: 16, textAlign: 'center' }}>📞 Besoin d'aide ?</div>
            {[
              { icon: '📱', value: '+229 01 69 30 30 19' },
              { icon: '🇺🇸', value: '+1 (240) 978-4155' },
              { icon: '✉️', value: 'contact@crfperfection.pro' },
              { icon: '🌐', value: 'www.crfperfection.pro' },
            ].map((c, i) => (
              <div key={i} style={{
                fontSize: 'clamp(12px, 1.8vw, 13px)', color: '#555', padding: '7px 0',
                display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
                borderBottom: i < 3 ? '1px solid rgba(0,115,244,0.06)' : 'none', wordBreak: 'break-word',
              }}>
                <span style={{ flexShrink: 0 }}>{c.icon}</span>{c.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Inscription