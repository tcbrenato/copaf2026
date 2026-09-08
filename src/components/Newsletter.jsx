import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'

const socials = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/crfperfection/',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1CkmqRu9Yj/?mibextid=wwXIfr',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.35A21 21 0 0 0 14.2 4.2c-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3H10.3V21h3.2Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/crf_perfection?igsh=cWkwZGIwYWdraHZw&utm_source=qr',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

const Newsletter = () => {
  const { t } = useTranslation()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.rpc('public_upsert_newsletter_subscriber', {
        p_prenom: prenom,
        p_nom: nom,
        p_email: email,
      })
      if (err) throw new Error(err.message)
      setDone(true)
    } catch (err) {
      console.error('Erreur inscription newsletter:', err)
      setError(t('newsletter.errorMessage'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-inner">
        <div className="newsletter-form-col">
          <h2 className="newsletter-title">{t('newsletter.title')}</h2>
          <div className="newsletter-underline" />
          <p className="newsletter-subtitle">{t('newsletter.subtitle')}</p>

          {done ? (
            <div className="newsletter-success">
              <p className="newsletter-success-title">{t('newsletter.successTitle')}</p>
              <p className="newsletter-success-body">{t('newsletter.successBody')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="newsletter-row">
                <div className="newsletter-field">
                  <label>{t('newsletter.labelFirstName')}</label>
                  <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder={t('newsletter.placeholderRequired')} />
                </div>
                <div className="newsletter-field">
                  <label>{t('newsletter.labelLastName')}</label>
                  <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t('newsletter.placeholderRequired')} />
                </div>
              </div>
              <div className="newsletter-field">
                <label>{t('newsletter.labelEmail')}</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('newsletter.placeholderRequired')} />
              </div>

              {error && <p className="newsletter-error">{error}</p>}

              <button type="submit" className="newsletter-submit" disabled={loading}>
                {loading ? t('newsletter.submitLoading') : t('newsletter.submit')}
              </button>
            </form>
          )}
        </div>

        <div className="newsletter-social-col">
          <img src="/logocopaf.png" alt="COPAF 2026" className="newsletter-social-logo" />
          <p className="newsletter-social-title">{t('newsletter.socialTitle')}</p>
          <div className="newsletter-social-icons">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .newsletter-section { background: #0a1128; padding: clamp(48px, 7vw, 76px) clamp(20px, 5vw, 40px); }
        .newsletter-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1.4fr 1fr; gap: clamp(32px, 5vw, 64px);
        }
        .newsletter-title { font-size: clamp(28px, 3.4vw, 38px); font-weight: 900; color: #fff; margin: 0 0 12px; letter-spacing: -0.02em; }
        .newsletter-underline { width: 90px; height: 4px; border-radius: 2px; background: linear-gradient(90deg, #000E91, #0073F4); margin-bottom: 22px; }
        .newsletter-subtitle { font-size: 15px; color: rgba(255,255,255,0.65); line-height: 1.7; margin: 0 0 28px; max-width: 460px; }
        .newsletter-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
        .newsletter-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
        .newsletter-row .newsletter-field { margin-bottom: 0; }
        .newsletter-field label { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 600; }
        .newsletter-field input {
          padding: 13px 16px; border-radius: 8px; border: none;
          background: #fff; color: #0f172a; font-size: 14px; font-family: inherit;
          outline: none;
        }
        .newsletter-field input::placeholder { color: #94a3b8; }
        .newsletter-error { color: #fca5a5; font-size: 13px; margin: 0 0 16px; }
        .newsletter-submit {
          margin-top: 6px;
          background: #fff; color: #000E91; border: none; border-radius: 8px;
          padding: 14px 30px; font-size: 13px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
          font-family: inherit; cursor: pointer; transition: all 0.2s ease;
        }
        .newsletter-submit:hover { background: #0073F4; color: #fff; }
        .newsletter-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .newsletter-success { background: rgba(0,115,244,0.08); border: 1px solid rgba(0,115,244,0.25); border-radius: 12px; padding: 22px; max-width: 460px; }
        .newsletter-success-title { color: #fff; font-weight: 800; font-size: 15px; margin: 0 0 6px; }
        .newsletter-success-body { color: rgba(255,255,255,0.7); font-size: 13.5px; line-height: 1.6; margin: 0; }
        .newsletter-social-col { background: #000E91; border-radius: 16px; padding: clamp(28px, 3vw, 36px); display: flex; flex-direction: column; }
        .newsletter-social-logo { height: 44px; width: auto; object-fit: contain; margin-bottom: 22px; }
        .newsletter-social-title { color: #fff; font-size: 17px; font-weight: 800; line-height: 1.4; margin: 0 0 24px; flex: 1; }
        .newsletter-social-icons { display: flex; gap: 10px; }
        .newsletter-social-icons a {
          width: 38px; height: 38px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1); color: #fff;
          transition: background 0.2s ease;
        }
        .newsletter-social-icons a:hover { background: #0073F4; }
        @media (max-width: 800px) {
          .newsletter-inner { grid-template-columns: 1fr; }
          .newsletter-row { grid-template-columns: 1fr; gap: 18px; }
          .newsletter-row .newsletter-field { margin-bottom: 0; }
        }
      `}</style>
    </section>
  )
}

export default Newsletter
