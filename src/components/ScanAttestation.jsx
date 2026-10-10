// src/components/ScanAttestation.jsx
//
// Bouton + fenêtre de scan du QR code d'une attestation (caméra, html5-qrcode chargé à la demande).
// Le QR encode https://copaf-ports.com/verifier/COPAF-2026-EXEC-XXXX : on en extrait le numéro puis on ouvre la vérification.

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { extraireCodeAttestation } from '../utils/attestationsConfig'

const TR = {
  fr: { bouton: 'Scanner le QR code d\'une attestation', titre: 'Scanner un QR code', aide: 'Placez le QR code de l\'attestation dans le cadre.', fermer: 'Fermer', camera: 'Impossible d\'accéder à la caméra. Autorisez-la dans le navigateur, ou saisissez le numéro.', inconnu: 'Ce QR code n\'est pas celui d\'une attestation COPAF.' },
  en: { bouton: 'Scan a certificate QR code', titre: 'Scan a QR code', aide: 'Place the certificate\'s QR code inside the frame.', fermer: 'Close', camera: 'Cannot access the camera. Allow it in the browser, or type the number.', inconnu: 'This QR code is not a COPAF certificate.' },
}

export default function ScanAttestation({ lang = 'fr' }) {
  const t = TR[lang === 'en' ? 'en' : 'fr']
  const navigate = useNavigate()
  const [ouvert, setOuvert] = useState(false)
  const [message, setMessage] = useState('')
  const scannerRef = useRef(null)

  useEffect(() => {
    if (!ouvert) return undefined
    let arrete = false
    let scanner = null
    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (arrete) return
        scanner = new Html5Qrcode('scan-attestation-lecteur')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          texte => {
            const code = extraireCodeAttestation(texte)
            if (code) { arrete = true; navigate(`/verifier/${code}`) } else setMessage(t.inconnu)
          },
          () => { /* image sans QR lisible : normal en continu */ },
        )
      } catch {
        if (!arrete) setMessage(t.camera)
      }
    })()
    return () => {
      arrete = true
      const s = scannerRef.current
      scannerRef.current = null
      if (s) Promise.resolve(s.stop()).then(() => s.clear()).catch(() => {})
    }
  }, [ouvert, navigate, t.camera, t.inconnu])

  const ouvrir = () => { setMessage(''); setOuvert(true) }

  return (
    <>
      <button type="button" onClick={ouvrir} style={{ display: 'block', margin: '0 auto 24px', minHeight: 46, padding: '0 20px', borderRadius: 12, border: '1.5px solid #0B1F66', background: '#fff', color: '#0B1F66', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
        ▣ {t.bouton}
      </button>
      {ouvert && (
        <div role="dialog" aria-modal="true" aria-label={t.titre}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 2000, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 18, padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0B1F66', marginBottom: 6 }}>{t.titre}</div>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#64748b' }}>{t.aide}</p>
            <div id="scan-attestation-lecteur" style={{ width: '100%', minHeight: 240, borderRadius: 12, overflow: 'hidden', background: '#0f172a' }} />
            {message && <p style={{ margin: '12px 0 0', fontSize: 13.5, fontWeight: 700, color: '#b91c1c' }}>{message}</p>}
            <button type="button" onClick={() => setOuvert(false)} style={{ marginTop: 14, minHeight: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: '#0B1F66', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{t.fermer}</button>
          </div>
        </div>
      )}
    </>
  )
}
