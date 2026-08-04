import { useState } from 'react'
import { supabase } from '../supabase'

const BROCHURE_URL = '/brochure-copaf-2026.pdf'

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
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('brochure_leads').insert([{
        nom, email, organisation,
        source: 'site_brochure_button',
      }])
      if (err) throw new Error(err.message)

      const a = document.createElement('a')
      a.href = BROCHURE_URL
      a.download = 'Brochure_COPAF_2026.pdf'
      a.click()

      setDone(true)
    } catch (err) {
      setError("Une erreur est survenue. Réessayez, ou téléchargez directement : ")
    }
    setLoading(false)
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
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Télécharger la brochure</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Programme complet COPAF 2026</div>
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
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Téléchargement lancé !</div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
                Si le fichier ne s'est pas ouvert automatiquement, cliquez ci-dessous.
              </p>
              <a href={BROCHURE_URL} download="Brochure_COPAF_2026.pdf" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                background: '#EBF3FF', color: '#000E91', borderRadius: 10, fontWeight: 700,
                fontSize: 13, textDecoration: 'none',
              }}>
                <Ico name="download" size={15} color="#000E91" />
                Télécharger à nouveau
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, margin: '0 0 20px' }}>
                Renseignez vos coordonnées pour recevoir immédiatement la brochure détaillée
                (programme, axes thématiques, modalités, tarifs).
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Nom complet *</label>
                <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom" style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Email professionnel *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@organisation.com" style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>Organisation (facultatif)</label>
                <input value={organisation} onChange={e => setOrganisation(e.target.value)} placeholder="Port / Entreprise" style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                }} />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#dc2626', marginBottom: 16 }}>
                  {error}<a href={BROCHURE_URL} download style={{ color: '#dc2626', fontWeight: 700 }}>cliquez ici</a>.
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg,#0073F4,#000E91)',
                border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit',
              }}>
                <Ico name="download" size={16} color="#fff" />
                {loading ? 'Un instant...' : 'Recevoir la brochure'}
              </button>

              <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
                Vos coordonnées servent uniquement à vous informer sur la COPAF 2026. Aucune revente à des tiers.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Bouton réutilisable — deux variantes sobres :
// "outline"  → fond clair, pour sections claires (par défaut)
// "ghost"    → texte souligné transparent, pour fonds sombres comme le Hero
export default function BrochureDownloadButton({ label = 'Télécharger la brochure', variant = 'outline', className = '' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`brochure-btn brochure-btn--${variant} ${className}`}
      >
        {variant === 'outline' && <Ico name="file" size={16} />}
        {label}
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

        /* Variante claire — sections sur fond blanc */
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

        /* Variante ghost — texte souligné, pour le Hero sur fond sombre */
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