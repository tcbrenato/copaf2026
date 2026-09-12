import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import SeoHead from '../components/SeoHead'
import DocumentsSection from '../components/DocumentsSection'
import { generateQrCard } from '../utils/generateQrCard'

const BLUE = '#0284C7'

const JOUR_LABEL = {
  1: { date: '19 Octobre', sub: 'Jour 1' },
  2: { date: '20 Octobre', sub: 'Jour 2' },
  3: { date: '21 Octobre', sub: 'Jour 3' },
}

export default function EspaceIntervenant() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [intervenant, setIntervenant] = useState(null)
  const [qr, setQr] = useState('')
  const [telechargement, setTelechargement] = useState(false)
  const [badgeDoc, setBadgeDoc] = useState(null)

  const onDocsChange = docs => {
    setBadgeDoc(docs.find(d => /badge/i.test(d.label)) || null)
  }

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
    QRCode.toDataURL(badgeUrl, { width: 320, margin: 1, color: { dark: '#0F172A', light: '#FFFFFF' } })
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
    if (!nom.trim() || !email.trim() || !code.trim()) return
    setLoading(true); setErreur('')
    const { data, error } = await supabase.rpc('intervenant_login', { p_nom: nom.trim(), p_code: code.trim(), p_email: email.trim() })
    setLoading(false)
    if (error || !data) {
      setErreur("Nom, email ou code d'accès non reconnus. Vérifiez ces informations ou contactez l'organisation.")
      return
    }
    setIntervenant(data)
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box', background: '#F8FAFC', color: '#1E293B', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", position: 'relative' }}>
      <SeoHead title="Espace Intervenant — COPAF 2026" description="Espace personnel des intervenants COPAF 2026" type="website" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        .bento-card-light {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          min-width: 0;
          box-sizing: border-box;
        }
        /* Les enfants flex/grid ne retrecissent pas sous la largeur de leur
           contenu par defaut (min-width:auto) — un titre d'intervention ou
           un nom de fichier un peu long poussait alors toute la carte, et
           la page entiere, plus large que l'ecran sur mobile au lieu de
           passer a la ligne. */
        .bento-grid, .bento-grid > * { min-width: 0; }
        .bento-card-light:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
        }
        
        .light-input {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          transition: all 0.2s ease;
        }
        .light-input:focus {
          outline: none;
          border-color: ${BLUE};
          background: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
        }

        .btn-blue {
          background: #0284C7;
          color: #FFFFFF;
          font-weight: 700;
          transition: all 0.2s ease;
          border: none;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }
        .btn-blue:hover:not(:disabled) {
          background: #0369A1;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.4);
        }
        .btn-blue:disabled { opacity: 0.6; cursor: wait; }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 19px;
          top: 36px;
          bottom: -20px;
          width: 2px;
          background: #E2E8F0;
        }
        .timeline-item:last-child::before { display: none; }

        .bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 900px) {
          .bento-grid {
            grid-template-columns: 360px 1fr;
          }
          .col-span-full { grid-column: 1 / -1; }
        }
      `}</style>

      {/* Hero Header Lumineux */}
      <header style={{ position: 'relative', zIndex: 1, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ position: 'relative', width: '100%', height: 'clamp(140px, 20vw, 220px)', overflow: 'hidden' }}>
          <img 
            src="/coverscopaf.png" 
            alt="COPAF 2026" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.9) 100%)' }} />
        </div>

        <div style={{ maxWidth: 1100, margin: '-50px auto 0', padding: '0 24px 24px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: '#E0F2FE', border: '1px solid #BAE6FD', marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#0369A1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Portail Conférencier</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Espace Intervenant
          </h1>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
            Consultez vos accréditations, gérez vos horaires d'intervention et déposez vos supports de présentation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', position: 'relative', zIndex: 1 }}>
        {!intervenant ? (
          /* Formulaire de Connexion */
          <div className="bento-card-light" style={{ maxWidth: 440, margin: '20px auto 0', padding: '36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#E0F2FE', border: '1px solid #BAE6FD', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: BLUE }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Identification</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Entrez vos identifiants fournis par l'organisation</p>
            </div>

            <form onSubmit={connexion} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom complet</label>
                <input
                  value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex. William Odah" autoFocus
                  className="light-input" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email communiqué à l'organisation"
                  className="light-input" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code d'accès</label>
                <input
                  type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="Code reçu par email/organisation"
                  className="light-input" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              {erreur && (
                <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, color: '#DC2626', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{erreur}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-blue" style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 14, cursor: loading ? 'wait' : 'pointer', marginTop: 8 }}>
                {loading ? 'Connexion en cours...' : 'Accéder à mon espace'}
              </button>
            </form>
          </div>
        ) : (
          /* Bento Grid Intervenant Connecté */
          <div className="bento-grid">
            
            {/* Bento Card 1 : Profil Intervenant */}
            <div className="bento-card-light" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyBetween: 'space-between', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: BLUE, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 900, color: '#FFF', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
                    {intervenant.prenom?.[0]}{intervenant.nom?.[0]}
                  </div>
                  <button
                    type="button" onClick={() => { setIntervenant(null); setNom(''); setEmail(''); setCode('') }}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 10, padding: '7px 12px', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Déconnexion
                  </button>
                </div>

                <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Intervenant Officiel</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {intervenant.prenom} {intervenant.nom}
                </h2>
                <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  {intervenant.fonction}{intervenant.organisation ? ` — ${intervenant.organisation}` : ''}
                </p>
              </div>

              {/* Badge & Accès physique */}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/></svg>
                  <span>Pass & Badge d'accès</span>
                </div>

                {badgeDoc ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 12, textAlign: 'center' }}>
                    {/\.(png|jpe?g|webp|gif)$/i.test(badgeDoc.url) ? (
                      <a href={badgeDoc.url} target="_blank" rel="noreferrer" style={{ display: 'block', overflow: 'hidden', borderRadius: 10 }}>
                        <img src={badgeDoc.url} alt="Badge" style={{ width: '100%', display: 'block', borderRadius: 10 }} />
                      </a>
                    ) : (
                      <a href={badgeDoc.url} target="_blank" rel="noreferrer" className="btn-blue" style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 10, fontSize: 13, textDecoration: 'none' }}>
                        Afficher le badge PDF
                      </a>
                    )}
                    <span style={{ display: 'block', fontSize: 11, color: '#64748B', marginTop: 8 }}>À présenter lors des contrôles d'accès</span>
                  </div>
                ) : qr ? (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                    <div style={{ background: '#FFF', padding: 8, borderRadius: 12, display: 'inline-block', marginBottom: 12, border: '1px solid #E2E8F0' }}>
                      <img src={qr} alt="QR Code Badge" style={{ width: 120, height: 120, display: 'block' }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 12 }}>Badge provisoire / QR d'émargement</div>
                    <button type="button" onClick={telechargerQr} disabled={telechargement} className="btn-blue" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, cursor: telechargement ? 'wait' : 'pointer' }}>
                      {telechargement ? 'Génération...' : 'Télécharger le Pass'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Bento Card 2 : Timeline des Interventions */}
            <div className="bento-card-light" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E0F2FE', border: '1px solid #BAE6FD', display: 'grid', placeItems: 'center', color: BLUE }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>Planning d'intervention</h3>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Vos apparitions prévues lors du programme</span>
                  </div>
                </div>
              </div>

              {Array.isArray(intervenant.interventions) && intervenant.interventions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                  {intervenant.interventions.map((iv, i) => {
                    const infoJour = JOUR_LABEL[iv.jour] || { date: `Jour ${iv.jour}`, sub: '' }
                    return (
                      <div key={i} className="timeline-item" style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F1F5F9', border: `2px solid ${BLUE}`, display: 'grid', placeItems: 'center', flexShrink: 0, zIndex: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: BLUE }}>J{iv.jour}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16, boxSizing: 'border-box' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: BLUE, background: '#E0F2FE', padding: '4px 8px', borderRadius: 6 }}>
                              {infoJour.date} • {iv.heure}
                            </span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.4, overflowWrap: 'break-word' }}>{iv.titre}</div>
                          {iv.avec && (
                            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              <span>{iv.avec}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: 13.5 }}>
                  Aucune intervention enregistrée pour le moment.
                </div>
              )}
            </div>

            {/* Bento Card 3 : Espace Documents (Plein Largeur) */}
            <div className="bento-card-light col-span-full" style={{ padding: 28 }}>
              <DocumentsSection
                dossier={intervenant.dossier}
                table="documents_intervenants"
                bucket="documents-intervenants"
                titre="Supports & Documents"
                ajoutePar={`${intervenant.prenom} ${intervenant.nom}`.trim()}
                onDocsChange={onDocsChange}
              />
            </div>

          </div>
        )}
      </main>
    </div>
  )
}