// src/components/AttestationView.jsx
//
// Attestation de participation COPAF 2026 en HTML : A4 paysage (297 x 210 mm), imprimable, adaptée à l'écran du téléphone
// (la page est dessinée à 1123 x 794 px puis réduite à la largeur disponible). Utilisée par /verifier/:code.
// Le texte est celui fourni par le comité d'organisation, FR ou EN ; le PDF (generateAttestationPDF.js) reprend la même mise en page.

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { civiliteAffichee, nomAffiche, nomPays, prenomAffiche, urlVerification } from '../utils/attestationsConfig'
import { LARGEUR, HAUTEUR, NAVY, OR, TEXTES, LOGOS } from '../utils/attestationsTextes'

// Bande décorative « guillochée » : plusieurs ondes déphasées qui se croisent le long des quatre côtés
function onde(longueur, base, amp, periode, phase, vertical) {
  const pts = []
  for (let t = 0; t <= longueur; t += 3) {
    const d = base + amp * Math.sin((t / periode) * Math.PI * 2 + phase)
    pts.push(vertical ? `${d.toFixed(1)} ${t}` : `${t} ${d.toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}
function Guilloche() {
  const marge = 20
  const largeurBande = 26
  const centre = marge + largeurBande / 2
  const ondes = [0, 1, 2].map(i => (2 * Math.PI * i) / 3)
  const traits = []
  ondes.forEach((ph, i) => {
    const couleur = i === 1 ? OR : NAVY
    const opacite = i === 1 ? 0.75 : 0.5
    traits.push({ d: onde(LARGEUR, centre, 9, 30, ph, false), couleur, opacite, k: `h1${i}` })
    traits.push({ d: onde(LARGEUR, HAUTEUR - centre, 9, 30, ph, false), couleur, opacite, k: `h2${i}` })
    traits.push({ d: onde(HAUTEUR, centre, 9, 30, ph, true), couleur, opacite, k: `v1${i}` })
    traits.push({ d: onde(HAUTEUR, LARGEUR - centre, 9, 30, ph, true), couleur, opacite, k: `v2${i}` })
  })
  return (
    <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} style={{ position: 'absolute', top: 0, left: 0 }} aria-hidden="true">
      <rect x="10" y="10" width={LARGEUR - 20} height={HAUTEUR - 20} fill="none" stroke={NAVY} strokeWidth="3" />
      <rect x="16" y="16" width={LARGEUR - 32} height={HAUTEUR - 32} fill="none" stroke={OR} strokeWidth="1" />
      <g fill="none" strokeWidth="0.9">
        {traits.map(t => <path key={t.k} d={t.d} stroke={t.couleur} opacity={t.opacite} />)}
      </g>
      <rect x={marge + largeurBande + 6} y={marge + largeurBande + 6} width={LARGEUR - 2 * (marge + largeurBande + 6)} height={HAUTEUR - 2 * (marge + largeurBande + 6)} fill="none" stroke={OR} strokeWidth="1.5" />
      <rect x={marge + largeurBande + 11} y={marge + largeurBande + 11} width={LARGEUR - 2 * (marge + largeurBande + 11)} height={HAUTEUR - 2 * (marge + largeurBande + 11)} fill="none" stroke={NAVY} strokeWidth="0.6" />
    </svg>
  )
}

const SERIF = "'Cormorant Garamond', 'Times New Roman', Georgia, serif"
const SANS = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"

export default function AttestationView({ att, langue }) {
  const lang = langue === 'EN' ? 'EN' : 'FR'
  const T = TEXTES[lang]
  const [qr, setQr] = useState('')
  const conteneur = useRef(null)
  const [echelle, setEchelle] = useState(1)

  useEffect(() => {
    let actif = true
    QRCode.toDataURL(urlVerification(att.code, window.location.origin), { errorCorrectionLevel: 'H', margin: 1, width: 320, color: { dark: NAVY, light: '#ffffff' } })
      .then(u => { if (actif) setQr(u) }).catch(() => {})
    return () => { actif = false }
  }, [att.code])

  useEffect(() => {
    const el = conteneur.current
    if (!el) return undefined
    const mesurer = () => setEchelle(Math.min(1, el.clientWidth / LARGEUR))
    mesurer()
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', mesurer); return () => window.removeEventListener('resize', mesurer) }
    const obs = new ResizeObserver(mesurer)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const nomComplet = `${civiliteAffichee(att.civilite, lang)} ${prenomAffiche(att.prenom)} ${nomAffiche(att.nom)}`.trim()
  const pays = nomPays(att.pays_iso2, lang, att.pays || '')

  return (
    <div ref={conteneur} className="attestation-cadre" style={{ width: '100%', maxWidth: LARGEUR, margin: '0 auto' }}>
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .attestation-cadre, .attestation-cadre * { visibility: visible !important; }
          .attestation-cadre { position: absolute; top: 0; left: 0; width: 297mm !important; max-width: none !important; height: 210mm !important; margin: 0 !important; box-shadow: none !important; }
          .attestation-reduction { transform: scale(${(297 / 25.4 * 96 / LARGEUR).toFixed(5)}) !important; width: ${LARGEUR}px !important; height: ${HAUTEUR}px !important; }
        }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: HAUTEUR * echelle, background: '#fff', boxShadow: '0 12px 40px rgba(11,31,102,0.18)' }}>
        <div className="attestation-reduction" style={{ position: 'absolute', top: 0, left: 0, width: LARGEUR, height: HAUTEUR, transformOrigin: 'top left', transform: `scale(${echelle})`, background: '#fff', color: NAVY, fontFamily: SANS, overflow: 'hidden' }}>
          <Guilloche />

          <div style={{ position: 'absolute', top: 64, right: 72, bottom: 62, left: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* En-tête : logos et organisateurs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {LOGOS.map((l, i) => (
                <img key={l.src} src={l.src} alt={l.alt} crossOrigin="anonymous" style={{ height: 50, width: 'auto', objectFit: 'contain', marginLeft: i ? 26 : 0 }} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11.5, fontWeight: 800, letterSpacing: 3, color: OR }}>{T.organisateurs}</div>
            <div style={{ marginTop: 2, fontSize: 14, fontWeight: 800, letterSpacing: 1.5 }}>{T.conference}</div>

            {/* Titre */}
            <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 31, fontWeight: 700, letterSpacing: 1, lineHeight: 1.1 }}>{T.titre}</div>
            <div style={{ width: 170, height: 2, background: OR, margin: '9px auto 0' }} />

            <div style={{ marginTop: 12, fontFamily: SERIF, fontStyle: 'italic', fontSize: 19 }}>{T.certifie}</div>

            {/* Identité */}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {att.pays_iso2 && (
                <img src={`https://flagcdn.com/w160/${String(att.pays_iso2).toLowerCase()}.png`} alt={pays} title={pays} crossOrigin="anonymous"
                  style={{ height: 34, width: 'auto', border: '1px solid rgba(11,31,102,0.25)', marginRight: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              )}
              <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, lineHeight: 1.1 }}>{nomComplet}</div>
              {att.logo_url && (
                <img src={att.logo_url} alt={att.autorite_portuaire || ''} crossOrigin="anonymous" style={{ height: 44, width: 'auto', objectFit: 'contain', marginLeft: 18 }} />
              )}
            </div>
            <div style={{ marginTop: 7, fontSize: 15 }}><span style={{ color: OR, fontWeight: 800 }}>{T.fonction}</span><strong>{att.fonction}</strong></div>
            <div style={{ marginTop: 3, fontSize: 15 }}><span style={{ color: OR, fontWeight: 800 }}>{T.organisme}</span><strong>{att.autorite_portuaire}</strong></div>

            {/* Corps */}
            <div style={{ marginTop: 12, maxWidth: 840, fontSize: 15, lineHeight: 1.5 }}>{T.suivi}</div>
            <div style={{ marginTop: 7, fontSize: 15, lineHeight: 1.45 }}>{T.tenue}</div>
            <div style={{ marginTop: 7, fontFamily: SERIF, fontStyle: 'italic', fontSize: 18 }}>{T.delivre}</div>

            {/* Pied : signatures et vérification */}
            <div style={{ marginTop: 'auto', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ width: 290 }}>
                <div style={{ height: 1, background: NAVY, marginBottom: 6 }} />
                <div style={{ fontWeight: 800, fontSize: 14 }}>{T.signataires[0].nom}</div>
                <div style={{ fontSize: 12.5 }}>{T.signataires[0].role}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                {qr && <img src={qr} alt={T.qr} style={{ width: 92, height: 92, display: 'block', margin: '0 auto' }} />}
                <div style={{ marginTop: 3, fontSize: 11.5 }}>{T.numero}<strong>{att.code}</strong></div>
              </div>
              <div style={{ width: 290 }}>
                <div style={{ height: 1, background: NAVY, marginBottom: 6 }} />
                <div style={{ fontWeight: 800, fontSize: 14 }}>{T.signataires[1].nom}</div>
                <div style={{ fontSize: 12.5 }}>{T.signataires[1].role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
