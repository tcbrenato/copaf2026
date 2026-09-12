// src/pages/EspaceIntervenant.jsx
//
// Espace personnel des intervenants du programme (distinct de l'espace
// participant /verifier) : pas d'inscription, pas de paiement, pas d'email
// requis — connexion par nom + code d'accès partage (voir migration
// create_intervenants_espace et la fonction intervenant_login), pensee pour
// une quinzaine de personnes connues a l'avance par l'organisation.
//
// Documents : reutilise DocumentsSection sur la table/bucket
// documents_intervenants (separee de documents_participants pour ne pas
// ouvrir en public l'upload sur les documents des participants).

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import SeoHead from '../components/SeoHead'
import DocumentsSection from '../components/DocumentsSection'
import { generateQrCard } from '../utils/generateQrCard'

const NAVY = '#00367F'
const BLUE = '#1798F4'

const JOUR_LABEL = { 1: 'Jour 1 — 19 octobre', 2: 'Jour 2 — 20 octobre', 3: 'Jour 3 — 21 octobre' }

export default function EspaceIntervenant() {
  const [nom, setNom] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [intervenant, setIntervenant] = useState(null)
  const [qr, setQr] = useState('')
  const [telechargement, setTelechargement] = useState(false)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  useEffect(() => {
    if (!intervenant?.badge_token) { setQr(''); return }
    let cancelled = false
    const badgeUrl = `https://copaf-ports.com/badge/${intervenant.badge_token}`
    QRCode.toDataURL(badgeUrl, { width: 320, margin: 1, color: { dark: '#000E91', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setQr(url) })
      .catch(() => { if (!cancelled) setQr('') })
    return () => { cancelled = true }
  }, [intervenant?.badge_token])

  const telechargerQr = async () => {
    if (!qr || !intervenant) return
    setTelechargement(true)
    try {
      await generateQrCard({
        qrDataUrl: qr,
        nomPrenom: `${intervenant.prenom} ${intervenant.nom}`.trim(),
        sousTitre: intervenant.fonction,
        dossier: intervenant.dossier,
        fileName: `Badge-${intervenant.dossier}.png`,
      })
    } finally {
      setTelechargement(false)
    }
  }

  const connexion = async e => {
    e.preventDefault()
    if (!nom.trim() || !code.trim()) return
    setLoading(true); setErreur('')
    const { data, error } = await supabase.rpc('intervenant_login', { p_nom: nom.trim(), p_code: code.trim() })
    setLoading(false)
    if (error || !data) {
      setErreur("Nom non reconnu ou code d'accès invalide. Vérifiez ces informations ou contactez l'organisation.")
      return
    }
    setIntervenant(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fc', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif" }}>
      <SeoHead title="Espace intervenant — COPAF 2026" description="Espace personnel des intervenants COPAF 2026" type="website" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <header style={{ background: NAVY }}>
        <img src="/coverscopaf.png" alt="COPAF 2026 — Conférence des Ports Africains" style={{ width: '100%', height: 'clamp(90px,18vw,190px)', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px clamp(20px, 5vw, 48px) 22px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 900, margin: '0 0 6px', color: '#fff', letterSpacing: '-0.01em' }}>
            Espace intervenant
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
            Retrouvez votre badge, votre lettre d'invitation et les documents liés à votre intervention — et déposez-y votre présentation.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(28px, 5vw, 40px) clamp(20px, 5vw, 48px) 80px' }}>
        {!intervenant ? (
          <form onSubmit={connexion} style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.06)' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Nom complet</label>
              <input
                value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex. William Odah" autoFocus
                style={{ width: '100%', padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Code d'accès intervenant</label>
              <input
                value={code} onChange={e => setCode(e.target.value)} placeholder="Communiqué par l'organisation"
                style={{ width: '100%', padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {erreur && (
              <p style={{ fontSize: 12.5, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
                {erreur}
              </p>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px 16px', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: '#fff', background: NAVY, cursor: loading ? 'wait' : 'pointer',
            }}>
              {loading ? 'Vérification...' : 'Accéder à mon espace'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.06)', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                Bienvenue
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a1128', margin: '0 0 4px' }}>
                {intervenant.prenom} {intervenant.nom}
              </h2>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
                {intervenant.fonction}{intervenant.organisation ? ` — ${intervenant.organisation}` : ''}
              </p>

              {qr && (
                <div style={{ marginTop: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: '14px', background: '#f8fafc', border: '1px solid #eef1f8', borderRadius: 12 }}>
                  <img src={qr} alt="QR code badge" style={{ width: 72, height: 72, borderRadius: 10, border: '1.5px solid #e2e8f0', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0a1128' }}>Mon badge / QR code</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>À présenter à l'accueil pour le pointage</div>
                  </div>
                  <button type="button" onClick={telechargerQr} disabled={telechargement} style={{
                    padding: '9px 14px', border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                    color: '#fff', background: NAVY, cursor: telechargement ? 'wait' : 'pointer', flexShrink: 0,
                  }}>
                    {telechargement ? 'Génération...' : 'Télécharger'}
                  </button>
                </div>
              )}

              {Array.isArray(intervenant.interventions) && intervenant.interventions.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    Mes interventions
                  </div>
                  {intervenant.interventions.map((iv, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #eef1f8', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 3 }}>
                        {JOUR_LABEL[iv.jour] || `Jour ${iv.jour}`} · {iv.heure}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0a1128' }}>{iv.titre}</div>
                      {iv.avec && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Avec {iv.avec}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid rgba(0,54,127,0.08)', boxShadow: '0 8px 24px rgba(0,54,127,0.06)' }}>
              <DocumentsSection
                dossier={intervenant.dossier}
                table="documents_intervenants"
                bucket="documents-intervenants"
                titre="Mes documents"
                ajoutePar={`${intervenant.prenom} ${intervenant.nom}`.trim()}
              />
            </div>

            <button
              type="button"
              onClick={() => { setIntervenant(null); setNom(''); setCode('') }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
