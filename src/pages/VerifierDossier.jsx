import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateBadge } from '../utils/generateBadge'
import { generateProformaPDF } from '../utils/generateProformaPDF'
import { generateFactureDefinitivePDF } from '../utils/generateFactureDefinitivePDF'
import { generateICS } from '../utils/generateICS'

const CONTACT_PHONE = '+229 69 30 30 19'
const OFFICIAL_IBAN = 'BJ66BJ083010010005027398097'

const STATUT_LABEL = {
  en_attente: { label: 'En cours de traitement', color: '#d97706', bg: '#fef3c7' },
  reserve:    { label: 'Place réservée — en attente de règlement', color: '#2563eb', bg: '#dbeafe' },
  confirme:   { label: 'Traité — documents disponibles', color: '#059669', bg: '#d1fae5' },
  annule:     { label: 'Annulé', color: '#dc2626', bg: '#fee2e2' },
}

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shield:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bank:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    mail:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    download:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    badge:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    receipt: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>,
    calendar:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    plus:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  }
  return icons[name] || null
}

// ── Timeline de progression ──
function ProgressTimeline({ statut }) {
  const steps = [
    { key: 'inscrit',  label: 'Inscription reçue' },
    { key: 'paiement', label: 'Paiement' },
    { key: 'confirme', label: 'Confirmé' },
  ]
  const activeIndex = statut === 'confirme' ? 2 : statut === 'annule' ? -1 : 1

  if (statut === 'annule') {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#991b1b', fontWeight: 600, textAlign: 'center' }}>
        Dossier annulé
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4 }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {i > 0 && (
            <div style={{
              position: 'absolute', top: 13, right: '50%', width: '100%', height: 3,
              background: i <= activeIndex ? '#0073F4' : '#e2e8f0', zIndex: 0,
            }} />
          )}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i <= activeIndex ? '#0073F4' : '#e2e8f0',
            color: i <= activeIndex ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 800,
          }}>
            {i < activeIndex ? <Ico name="check" size={13} color="#fff" /> : i + 1}
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: i <= activeIndex ? '#0073F4' : '#94a3b8', marginTop: 6, textAlign: 'center' }}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Carte badge numerique (style wallet, sans compte Apple/Google requis) ──
function DigitalBadgeCard({ data }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg,#000E91,#0073F4)', borderRadius: 20, padding: 24,
      color: '#fff', boxShadow: '0 12px 32px rgba(0,14,145,.3)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>COPAF 2026</div>
          <div style={{ fontSize: 10, opacity: 0.55 }}>Badge participant numérique</div>
        </div>
        <Ico name="badge" size={22} color="rgba(255,255,255,.6)" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{data.prenom} {data.nom}</div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>{data.poste}</div>
      <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 18 }}>{data.organisation}</div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 14,
      }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: 1, opacity: 0.85 }}>{data.dossier}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>15–17 Sept. Casablanca</span>
      </div>
    </div>
  )
}

export default function VerifierDossier() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(undefined)
  const [error,   setError]   = useState('')

  const [trackEmail,   setTrackEmail]   = useState('')
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackResult,  setTrackResult]  = useState(undefined)
  const [trackError,   setTrackError]   = useState('')
  const [genLoading,   setGenLoading]   = useState('')

  const executeVerification = async (rawValue) => {
    const cleanedInput = rawValue.trim()
    if (!cleanedInput) return

    setLoading(true); setError(''); setResult(undefined); setTrackResult(undefined); setTrackEmail('')

    const inputAsIban = cleanedInput.replace(/\s+/g, '')
    if (inputAsIban === OFFICIAL_IBAN) {
      setResult({ type: 'iban' })
      setLoading(false)
      return
    }

    try {
      const { data, error: err } = await supabase.rpc('verifier_dossier', { p_dossier: cleanedInput })
      if (err) throw new Error(err.message)
      if (data && data.length > 0) setResult({ type: 'dossier', ...data[0] })
      else setResult(null)
    } catch (err) {
      setError('Erreur lors de la vérification. Réessayez ou contactez-nous directement.')
      setResult(undefined)
    }
    setLoading(false)
  }

  const handleSearch = e => { e.preventDefault(); executeVerification(input) }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dossierParam = params.get('dossier') || params.get('ref') || params.get('iban')
    if (dossierParam) { setInput(dossierParam); executeVerification(dossierParam) }
  }, [])

  const handleTrackSubmit = async e => {
    e.preventDefault()
    if (!trackEmail.trim() || !result?.dossier) return
    setTrackLoading(true); setTrackError(''); setTrackResult(undefined)
    try {
      const { data, error: err } = await supabase.rpc('suivi_dossier', { p_dossier: result.dossier, p_email: trackEmail.trim() })
      if (err) throw new Error(err.message)
      setTrackResult(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      setTrackError('Erreur lors de la vérification. Réessayez ou contactez-nous directement.')
      setTrackResult(undefined)
    }
    setTrackLoading(false)
  }

  const formData = () => ({
    nom: trackResult.nom, prenom: trackResult.prenom, organisation: trackResult.organisation,
    poste: trackResult.poste, pays: trackResult.pays, email: trackResult.email,
  })

  const handleDownloadRecap = async () => {
    setGenLoading('recap')
    try {
      await generateRecapPDF({ form: formData(), dossier: trackResult.dossier, nb: trackResult.participants, total: trackResult.montant, paiementMode: trackResult.paiement_mode })
    } finally { setGenLoading('') }
  }

  const handleDownloadProforma = async () => {
    setGenLoading('proforma')
    try {
      await generateProformaPDF({ form: formData(), dossier: trackResult.dossier, nb: trackResult.participants, total: trackResult.montant })
    } finally { setGenLoading('') }
  }

  const handleDownloadFacture = async () => {
    if (!trackResult.numero_facture) return
    setGenLoading('facture')
    try {
      await generateFactureDefinitivePDF({ form: formData(), dossier: trackResult.dossier, numeroFacture: trackResult.numero_facture, nb: trackResult.participants, total: trackResult.montant })
    } finally { setGenLoading('') }
  }

  const handleDownloadBadge = async () => {
    setGenLoading('badge')
    try {
      await generateBadge({ nomPrenom: `${trackResult.prenom} ${trackResult.nom}`, fonction: trackResult.poste || '', dossier: trackResult.dossier, photoSrc: trackResult.photo_url || null })
    } finally { setGenLoading('') }
  }

  const handleAddToCalendar = () => generateICS({ dossier: trackResult?.dossier })

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#000E91', borderRadius: 100, padding: '8px 22px', marginBottom: 20 }}>
            <Ico name="shield" size={14} color="#0073F4" />
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>Vérification &amp; suivi de dossier</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4.5vw,38px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, lineHeight: 1.15 }}>
            Vérifiez vos informations COPAF 2026
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Entrez votre numéro de dossier <strong>ou collez l'IBAN reçu</strong> pour confirmer l'authenticité de votre demande, et accédez ensuite à votre espace personnel.
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
            placeholder="N° de dossier ou IBAN officiel..."
            style={{ flex: '1 1 220px', padding: '14px 16px', fontSize: 15, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
            background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: loading ? 0.7 : 1, flexShrink: 0,
          }}>
            {loading ? <div className="spinner" /> : <Ico name="search" size={16} color="#fff" />}
            Vérifier
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {result && result.type === 'iban' && (
          <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(5,150,105,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="check" size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>RIB Officiel Certifié &amp; Authentique</div>
                <div style={{ fontSize: 13, color: '#047857', marginTop: 2, lineHeight: 1.4 }}>
                  L'IBAN que vous avez copié correspond exactement au compte bancaire officiel de la <strong>COPAF 2026 (SGBE Bénin)</strong>. Vous pouvez procéder à votre virement en toute sécurité.
                </div>
              </div>
            </div>
          </div>
        )}

        {result && result.type === 'dossier' && (
          <div style={{ background: '#fff', border: '1.5px solid #a7f3d0', borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: '0 8px 32px rgba(5,150,105,.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico name="check" size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Dossier vérifié et authentique</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Ce numéro correspond bien à une inscription COPAF 2026 réelle.</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              {[
                { l: 'Dossier',      v: result.dossier },
                { l: 'Titulaire',    v: `${result.initiales} — ${result.organisation || 'N/A'}` },
                { l: 'Participants', v: result.participants },
                { l: 'Statut',       v: (STATUT_LABEL[result.statut] || {}).label || result.statut },
                { l: "Date d'inscription", v: new Date(result.date_inscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid #eef2f7' : 'none', fontSize: 13.5 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.l}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* ── Espace personnel deverrouille par email ── */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 22 }}>
              <div style={{ fontSize: 10, color: '#0073F4', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                Mon espace personnel
              </div>
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                Confirmez l'email utilisé lors de votre inscription pour accéder à votre badge numérique, vos documents et le suivi détaillé de votre dossier.
              </p>

              <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <input
                  type="email" required value={trackEmail}
                  onChange={e => setTrackEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={{ flex: '1 1 200px', padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={trackLoading} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '11px 18px',
                  background: '#000E91', border: 'none', borderRadius: 10, color: '#fff',
                  fontWeight: 700, fontSize: 12.5, cursor: trackLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: trackLoading ? 0.7 : 1, flexShrink: 0,
                }}>
                  {trackLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Ico name="mail" size={14} color="#fff" />}
                  Valider
                </button>
              </form>

              {trackError && <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 8 }}>{trackError}</div>}

              {trackResult === null && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#991b1b' }}>
                  Cet email ne correspond pas au dossier renseigné. Vérifiez l'adresse utilisée lors de votre inscription.
                </div>
              )}

              {trackResult && (
                <div style={{ marginTop: 10 }}>
                  {/* Timeline */}
                  <div style={{ marginBottom: 22 }}>
                    <ProgressTimeline statut={trackResult.statut} />
                  </div>

                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100,
                    padding: '7px 16px', marginBottom: 20,
                    background: (STATUT_LABEL[trackResult.statut] || {}).bg || '#f1f5f9',
                    color: (STATUT_LABEL[trackResult.statut] || {}).color || '#334155',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {(STATUT_LABEL[trackResult.statut] || {}).label || trackResult.statut}
                  </div>

                  {/* Badge numerique visuel */}
                  {trackResult.statut === 'confirme' && (
                    <div style={{ marginBottom: 22 }}>
                      <DigitalBadgeCard data={trackResult} />
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'center', lineHeight: 1.6 }}>
                        Astuce : faites une capture d'écran ou ajoutez cette page à votre écran d'accueil
                        pour un accès rapide le jour J.
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  <div style={{ fontSize: 10, color: '#0073F4', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                    Mes documents
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <button onClick={handleDownloadRecap} disabled={genLoading === 'recap'} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                      background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 10,
                      color: '#000E91', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {genLoading === 'recap' ? <div className="spinner" style={{ width: 13, height: 13, borderTopColor: '#000E91', borderColor: 'rgba(0,14,145,.3)' }} /> : <Ico name="download" size={14} color="#000E91" />}
                      Récapitulatif
                    </button>

                    <button onClick={handleDownloadProforma} disabled={genLoading === 'proforma'} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                      background: '#fdf2f4', border: '1.5px solid #f3c9d0', borderRadius: 10,
                      color: '#96182A', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {genLoading === 'proforma' ? <div className="spinner" style={{ width: 13, height: 13, borderTopColor: '#96182A', borderColor: 'rgba(150,24,42,.3)' }} /> : <Ico name="receipt" size={14} color="#96182A" />}
                      Facture proforma
                    </button>

                    {trackResult.numero_facture && (
                      <button onClick={handleDownloadFacture} disabled={genLoading === 'facture'} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                        background: '#fef3c7', border: '1.5px solid #fcd34d', borderRadius: 10,
                        color: '#92400e', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {genLoading === 'facture' ? <div className="spinner" style={{ width: 13, height: 13, borderTopColor: '#92400e', borderColor: 'rgba(146,64,14,.3)' }} /> : <Ico name="receipt" size={14} color="#92400e" />}
                        Facture définitive
                      </button>
                    )}

                    {trackResult.statut === 'confirme' && (
                      <button onClick={handleDownloadBadge} disabled={genLoading === 'badge'} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                        background: '#d1fae5', border: '1.5px solid #6ee7b7', borderRadius: 10,
                        color: '#065f46', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                        {genLoading === 'badge' ? <div className="spinner" style={{ width: 13, height: 13, borderTopColor: '#065f46', borderColor: 'rgba(6,95,70,.3)' }} /> : <Ico name="badge" size={14} color="#065f46" />}
                        Badge (image)
                      </button>
                    )}

                    <button onClick={handleAddToCalendar} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px',
                      background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10,
                      color: '#334155', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      <Ico name="calendar" size={14} color="#334155" />
                      Ajouter au calendrier
                    </button>
                  </div>

                  {trackResult.statut !== 'confirme' && (
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>
                      Le badge sera disponible ici dès que votre paiement sera confirmé par notre équipe.
                    </p>
                  )}
                </div>
              )}
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
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7f1d1d' }}>Cette référence n'existe pas dans notre base</div>
                <div style={{ fontSize: 13, color: '#991b1b' }}>Ne procédez à aucun virement avant d'avoir vérifié l'authenticité de cette coordonnée.</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: '#7f1d1d', lineHeight: 1.7, margin: 0 }}>
              Si un tiers vous a fourni cet IBAN ou ce numéro en prétendant représenter COPAF 2026, contactez-nous
              immédiatement au <strong>{CONTACT_PHONE}</strong> avant tout virement bancaire.
            </p>
          </div>
        )}

        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="bank" size={18} color="#0073F4" />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>Coordonnées bancaires officielles — les SEULES valables</div>
          </div>
          {[
            { l: 'Banque',    v: 'SGBE Bénin', empha: false },
            { l: 'IBAN',      v: 'BJ66 BJ083 01001 00050273980 97', empha: true },
            { l: 'BIC',       v: 'SGBEBJ BX', empha: true },
            { l: 'Titulaire', v: 'COPAF 2026', empha: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{item.l}</span>
              <span style={{ fontSize: item.empha ? 14 : 13, color: item.empha ? '#000E91' : '#0f172a', fontWeight: 700, textAlign: 'right', wordBreak: 'break-all' }}>{item.v}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Ico name="alert" size={18} color="#d97706" />
          <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.75, margin: 0 }}>
            <strong>Nous ne changerons JAMAIS ces coordonnées bancaires</strong> par e-mail, SMS ou WhatsApp.
            Si une personne vous contacte avec un RIB différent en se faisant passer pour COPAF 2026, il s'agit
            d'une tentative de fraude. Vérifiez toujours sur <strong>copaf-ports.com/verifier</strong> avant
            tout virement, ou appelez-nous directement au <strong>{CONTACT_PHONE}</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}