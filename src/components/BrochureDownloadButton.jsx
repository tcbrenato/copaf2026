import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    file: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    close: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  }
  return icons[name] || null
}

function BrochureModal({ onClose }) {
  const { t, i18n } = useTranslation()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const isEn = i18n.language && i18n.language.toLowerCase().startsWith('en')
  const brochureUrl = isEn ? '/BrochureCOPAF2026ENGmaj.pdf' : '/BrochureCOPAF2026FRmaj.pdf'
  const brochureFilename = isEn ? 'BrochureCOPAF2026ENGmaj.pdf' : 'BrochureCOPAF2026FRmaj.pdf'

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Utilisation de upsert pour gérer proprement les e-mails déjà existants
      const { error: err } = await supabase.from('brochure_leads').upsert([{
        nom, 
        email, 
        organisation,
        source: 'site_brochure_button',
      }], { onConflict: 'email' })
      
      if (err) throw new Error(err.message)

      // Déclenchement du téléchargement
      const a = document.createElement('a')
      a.href = brochureUrl
      a.download = brochureFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setDone(true)
    } catch (err) {
      console.error("Erreur lead/téléchargement:", err)
      setError(t('brochure.error') || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="file" size={20} color="#0073F4" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{t('brochure.modalTitle')}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{t('brochure.modalSubtitle')}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico name="close" size={14} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: '20px 28px 28px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Ico name="check" size={26} color="#fff" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{t('brochure.successTitle')}</div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                {t('brochure.successBody')}
              </p>
              <a href={brochureUrl} download={brochureFilename} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                background: '#EBF3FF', color: '#000E91', borderRadius: 10, fontWeight: 700,
                fontSize: 13, textDecoration: 'none',
              }}>
                <Ico name="download" size={15} color="#000E91" />
                {t('brochure.downloadAgain')}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: '0 0 20px' }}>
                {t('brochure.formIntro')}
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>{t('brochure.labelName')}</label>
                <input required value={nom} onChange={e => setNom(e.target.value)} placeholder={t('brochure.placeholderName')} style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>{t('brochure.labelEmail')}</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('brochure.placeholderEmail')} style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>{t('brochure.labelOrganization')}</label>
                <input value={organisation} onChange={e => setOrganisation(e.target.value)} placeholder={t('brochure.placeholderOrganization')} style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#dc2626', marginBottom: 16 }}>
                  {error} <br/>
                  <a href={brochureUrl} download={brochureFilename} style={{ color: '#dc2626', fontWeight: 700, textDecoration: 'underline' }}>
                    {t('brochure.downloadAgain') || "Télécharger directement"}
                  </a>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg,#0073F4,#000E91)',
                border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              }}>
                <Ico name="download" size={16} color="#fff" />
                {loading ? t('brochure.submitLoading') : t('brochure.submit')}
              </button>

              <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
                {t('brochure.note')}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BrochureDownloadButton({ label, variant = 'outline', className = '' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const labelText = label || t('brochure.button')

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`brochure-btn brochure-btn--${variant} ${className}`}
      >
        {variant === 'outline' && <Ico name="file" size={16} />}
        {labelText}
      </button>

      <style>{`
        .brochure-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .brochure-btn--outline {
          padding: 12px 22px;
          background: #fff;
          color: #000E91;
          border: 1.5px solid #dbe6f7;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13.5px;
        }
        .brochure-btn--outline:hover {
          background: #F4F8FF;
          border-color: #0073F4;
        }
        .brochure-btn--ghost {
          padding: 0;
          background: none;
          color: rgba(255,255,255,0.85);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.4px;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .brochure-btn--ghost:hover {
          color: #fff;
        }
      `}</style>

      {open && <BrochureModal onClose={() => setOpen(false)} />}
    </>
  )
}