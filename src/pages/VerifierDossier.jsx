import { useState } from 'react'
import { supabase } from '../supabase'

const CONTACT_PHONE = '+229 01 97 67 22 00'

const STATUT_LABEL = {
  en_attente: { label: 'En attente de paiement', color: '#d97706', bg: '#fef3c7' },
  reserve:    { label: 'Place reservee',         color: '#2563eb', bg: '#dbeafe' },
  confirme:   { label: 'Inscription confirmee',  color: '#059669', bg: '#d1fae5' },
  annule:     { label: 'Annule',                 color: '#dc2626', bg: '#fee2e2' },
}

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shield: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bank:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  }
  return icons[name] || null
}

export default function VerifierDossier() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(undefined)
  const [error,   setError]   = useState('')

  const handleSearch = async e => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(undefined)

    try {
      const { data, error: err } = await supabase.rpc('verifier_dossier', { p_dossier: input.trim() })
      if (err) throw new Error(err.message)
      setResult(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      setError('Erreur lors de la verification. Reessayez ou contactez-nous directement.')
      setResult(undefined)
    }
    setLoading(false)
  }

  return (
    <section style={{
      padding: 'clamp(64px,10vw,120px) 0', minHeight: '100vh',
      background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#000E91', borderRadius: 100, padding: '8px 22px', marginBottom: 20,
          }}>
            <Ico name="shield" size={14} color="#0073F4" />
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>
              Verification anti-fraude
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4.5vw,38px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, lineHeight: 1.15 }}>
            Verifiez votre dossier COPAF 2026
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Entrez votre numero de dossier pour confirmer que votre inscription est bien enregistree chez nous,
            et retrouver les seules coordonnees bancaires officielles.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20,
          padding: 24, boxShadow: '0 8px 32px rgba(0,14,145,.08)', marginBottom: 24,
          display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex : COPAF2026-12345"
            style={{
              flex: '1 1 220px', padding: '14px 16px', fontSize: 15, fontFamily: 'inherit',
              color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: 12, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
            background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: loading ? 0.7 : 1, flexShrink: 0,
          }}>
            {loading ? <div className="spinner" /> : <Ico name="search" size={16} color="#fff" />}
            Verifier
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#fff', border: '1.5px solid #a7f3d0', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(5,150,105,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="check" size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Dossier verifie et authentique</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Ce numero correspond bien a une inscription COPAF 2026 reelle.</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px' }}>
              {[
                { l: 'Dossier',      v: result.dossier },
                { l: 'Titulaire',    v: `${result.initiales} — ${result.organisation || 'N/A'}` },
                { l: 'Participants', v: result.participants },
                { l: 'Statut',       v: (STATUT_LABEL[result.statut] || {}).label || result.statut },
                { l: 'Date',         v: new Date(result.date_inscription).toLocaleDateString('fr-FR') },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid #eef2f7' : 'none', fontSize: 13.5 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.l}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result === null && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="alert" size={22} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7f1d1d' }}>Ce numero n'existe pas dans notre base</div>
                <div style={{ fontSize: 13, color: '#991b1b' }}>Ne procedez a aucun virement avant d'avoir verifie l'authenticite de cette demande.</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#7f1d1d', lineHeight: 1.7, margin: 0 }}>
              Si quelqu'un vous a communique ce numero en pretendant representer COPAF 2026, contactez-nous
              immediatement au <strong>{CONTACT_PHONE}</strong> avant tout paiement.
            </p>
          </div>
        )}

        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="bank" size={18} color="#0073F4" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Coordonnees bancaires officielles — les SEULES valables</div>
          </div>
          {[
            { l: 'Banque',    v: 'SGBE Benin' },
            { l: 'IBAN',      v: 'BJ66 BJ083 01001 00050273980 97' },
            { l: 'BIC',       v: 'SGBEBJ BX' },
            { l: 'Titulaire', v: 'COPAF 2026' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{item.l}</span>
              <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{item.v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Ico name="alert" size={18} color="#d97706" />
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.75, margin: 0 }}>
            <strong>Nous ne changerons JAMAIS ces coordonnees bancaires</strong> par email, SMS ou WhatsApp.
            Si une personne vous contacte avec un RIB different en se faisant passer pour COPAF 2026, il s'agit
            d'une tentative de fraude. Verifiez toujours sur <strong>copaf-ports.com/verifier</strong> avant
            tout virement, ou appelez-nous directement au <strong>{CONTACT_PHONE}</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}
