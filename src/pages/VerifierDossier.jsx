import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { generateRecapPDF } from '../utils/generateRecapPDF'
import { generateBadge } from '../utils/generateBadge'

const CONTACT_PHONE = '+229 69 30 30 19'
const OFFICIAL_IBAN = 'BJ66BJ083010010005027398097' // Version nettoyée pour comparaison

const STATUT_LABEL = {
  en_attente: { label: 'En cours de traitement', color: '#d97706', bg: '#fef3c7' },
  reserve:    { label: 'Place réservée — en attente de règlement', color: '#2563eb', bg: '#dbeafe' },
  confirme:   { label: 'Traité — documents disponibles', color: '#059669', bg: '#d1fae5' },
  annule:     { label: 'Annulé', color: '#dc2626', bg: '#fee2e2' },
}

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shield: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bank:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
    mail:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    badge:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  }
  return icons[name] || null
}

export default function VerifierDossier() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(undefined) // undefined = rien, null = introuvable, {type: 'iban'} ou {...dossier}
  const [error,   setError]   = useState('')

  // ── Suivi de dossier (deuxieme facteur : email) ──
  const [trackEmail,   setTrackEmail]   = useState('')
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackResult,  setTrackResult]  = useState(undefined) // undefined = pas tente, null = email incorrect, {...} = donnees completes
  const [trackError,   setTrackError]   = useState('')
  const [genLoading,   setGenLoading]   = useState('') // 'recap' | 'badge' | ''

  const executeVerification = async (rawValue) => {
    const cleanedInput = rawValue.trim()
    if (!cleanedInput) return

    setLoading(true)
    setError('')
    setResult(undefined)
    setTrackResult(undefined)
    setTrackEmail('')

    // 1. Vérification si c'est l'IBAN officiel copié-collé
    const inputAsIban = cleanedInput.replace(/\s+/g, '') // Enlever tous les espaces
    if (inputAsIban === OFFICIAL_IBAN) {
      setResult({ type: 'iban' })
      setLoading(false)
      return
    }

    // 2. Sinon, on interroge la base de données Supabase pour le numéro de dossier
    try {
      const { data, error: err } = await supabase.rpc('verifier_dossier', { p_dossier: cleanedInput })
      if (err) throw new Error(err.message)

      if (data && data.length > 0) {
        setResult({ type: 'dossier', ...data[0] })
      } else {
        setResult(null) // Introuvable
      }
    } catch (err) {
      setError('Erreur lors de la vérification. Réessayez ou contactez-nous directement.')
      setResult(undefined)
    }
    setLoading(false)
  }

  const handleSearch = e => {
    e.preventDefault()
    executeVerification(input)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dossierParam = params.get('dossier') || params.get('ref') || params.get('iban')
    if (dossierParam) {
      setInput(dossierParam)
      executeVerification(dossierParam)
    }
  }, [])

  // ── Deblocage des documents via email ──
  const handleTrackSubmit = async e => {
    e.preventDefault()
    if (!trackEmail.trim() || !result?.dossier) return

    setTrackLoading(true)
    setTrackError('')
    setTrackResult(undefined)

    try {
      const { data, error: err } = await supabase.rpc('suivi_dossier', {
        p_dossier: result.dossier,
        p_email: trackEmail.trim(),
      })
      if (err) throw new Error(err.message)
      setTrackResult(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      setTrackError('Erreur lors de la vérification. Réessayez ou contactez-nous directement.')
      setTrackResult(undefined)
    }
    setTrackLoading(false)
  }

  const handleDownloadRecap = async () => {
    if (!trackResult) return
    setGenLoading('recap')
    try {
      await generateRecapPDF({
        form: {
          nom: trackResult.nom,
          prenom: trackResult.prenom,
          email: trackResult.email,
          telephone: trackResult.telephone,
          organisation: trackResult.organisation,
          poste: trackResult.poste,
          pays: trackResult.pays,
        },
        dossier: trackResult.dossier,
        nb: trackResult.participants,
        total: trackResult.montant,
        paiementMode: trackResult.paiement_mode,
      })
    } finally {
      setGenLoading('')
    }
  }

  const handleDownloadBadge = async () => {
    if (!trackResult) return
    setGenLoading('badge')
    try {
      await generateBadge({
        nomPrenom: `${trackResult.prenom} ${trackResult.nom}`,
        fonction: trackResult.poste || '',
        dossier: trackResult.dossier,
        photoSrc: trackResult.photo_url || null,
      })
    } finally {
      setGenLoading('')
    }
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
              Vérification &amp; suivi de dossier
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px,4.5vw,38px)', fontWeight: 900, color: '#0f172a', marginBottom: 12, lineHeight: 1.15 }}>
            Vérifiez vos informations COPAF 2026
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Entrez votre numéro de dossier <strong>ou collez l'IBAN reçu</strong> pour confirmer l'authenticité de votre demande de paiement, et accédez ensuite à vos documents.
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
            Vérifier
          </button>
        </form>

        {error && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#dc2626', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {/* CAS A : Succès - Validation du RIB collé */}
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

        {/* CAS B : Succès - Validation d'un numéro de dossier */}
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

            {/* ── Suivi et téléchargement des documents ── */}
            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 22 }}>
              <div style={{ fontSize: 10, color: '#0073F4', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                Voir mon statut détaillé et mes documents
              </div>
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                Pour votre sécurité, confirmez l'email utilisé lors de votre inscription pour débloquer vos documents.
              </p>

              <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <input
                  type="email"
                  required
                  value={trackEmail}
                  onChange={e => setTrackEmail(e.target.value)}
                  placeholder="votre@email.com"
                  style={{
                    flex: '1 1 200px', padding: '11px 14px', fontSize: 13.5, fontFamily: 'inherit',
                    color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    borderRadius: 10, outline: 'none', boxSizing: 'border-box',
                  }}
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

              {trackError && (
                <div style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 8 }}>{trackError}</div>
              )}

              {trackResult === null && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#991b1b' }}>
                  Cet email ne correspond pas au dossier renseigné. Vérifiez l'adresse utilisée lors de votre inscription.
                </div>
              )}

              {trackResult && (
                <div style={{ marginTop: 6 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 100,
                    padding: '7px 16px', marginBottom: 16,
                    background: (STATUT_LABEL[trackResult.statut] || {}).bg || '#f1f5f9',
                    color: (STATUT_LABEL[trackResult.statut] || {}).color || '#334155',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {(STATUT_LABEL[trackResult.statut] || {}).label || trackResult.statut}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={handleDownloadRecap} disabled={genLoading === 'recap'} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px',
                      background: '#EBF3FF', border: '1.5px solid #bfdbfe', borderRadius: 10,
                      color: '#000E91', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      fontFamily: 'inherit', opacity: genLoading === 'recap' ? 0.7 : 1,
                    }}>
                      {genLoading === 'recap' ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#000E91', borderColor: 'rgba(0,14,145,.3)' }} /> : <Ico name="download" size={15} color="#000E91" />}
                      Récapitulatif (PDF)
                    </button>

                    {trackResult.statut === 'confirme' && (
                      <button onClick={handleDownloadBadge} disabled={genLoading === 'badge'} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px',
                        background: '#d1fae5', border: '1.5px solid #6ee7b7', borderRadius: 10,
                        color: '#065f46', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'inherit', opacity: genLoading === 'badge' ? 0.7 : 1,
                      }}>
                        {genLoading === 'badge' ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#065f46', borderColor: 'rgba(6,95,70,.3)' }} /> : <Ico name="badge" size={15} color="#065f46" />}
                        Mon badge (PNG)
                      </button>
                    )}
                  </div>

                  {trackResult.statut !== 'confirme' && (
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, marginBottom: 0 }}>
                      Le badge sera disponible ici dès que votre paiement sera confirmé par notre équipe.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAS C : Introuvable */}
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

        {/* Coordonnées bancaires toujours visibles pour comparaison */}
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
              <span style={{
                fontSize: item.empha ? 14 : 13,
                color: item.empha ? '#000E91' : '#0f172a',
                fontWeight: 700,
                textAlign: 'right',
                wordBreak: 'break-all'
              }}>{item.v}</span>
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