import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { CARTE, NAVY, SKY, INK, MUTED, initiales } from './equipeTheme'

const SITE = 'https://copaf-ports.com'

// Rubrique « Mon badge digital » : photo, nom, titre (à défaut le rôle), mention « Comité d'organisation »,
// biographie (retours à la ligne conservés, bloc masqué si vide), QR personnel et bouton d'ouverture du badge.
// Le badge physique imprimé ne change pas : la biographie n'apparaît que sur cette version digitale.
export default function EquipeBadge({ membre, photoUrl, badgeToken, t }) {
  const [qr, setQr] = useState('')
  const lienBadge = String(membre.badge_url || '').trim() || (badgeToken ? `${SITE}/badge/${badgeToken}` : '')
  const titre = String(membre.titre || '').trim() || String(membre.role || '').trim()
  const biographie = String(membre.biographie || '').trim()

  useEffect(() => {
    if (!lienBadge) { setQr(''); return undefined }
    let annule = false
    QRCode.toDataURL(lienBadge, { width: 360, margin: 1, color: { dark: NAVY, light: '#FFFFFF' } })
      .then(url => { if (!annule) setQr(url) })
      .catch(() => { if (!annule) setQr('') })
    return () => { annule = true }
  }, [lienBadge])

  return (
    <section style={{ ...CARTE, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px 20px 20px', textAlign: 'center', background: `linear-gradient(160deg, ${NAVY}, #0a4fa3 70%, ${SKY})`, color: '#fff' }}>
        {photoUrl ? (
          <img src={photoUrl} alt={membre.nom} style={{ width: 112, height: 112, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '4px solid rgba(255,255,255,.85)' }} />
        ) : (
          <div style={{ width: 112, height: 112, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, background: 'rgba(255,255,255,.18)', border: '4px solid rgba(255,255,255,.6)' }}>{initiales(membre.nom)}</div>
        )}
        <h2 style={{ margin: '14px 0 4px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.01em' }}>{membre.nom}</h2>
        {titre && <div style={{ fontSize: 14.5, fontWeight: 600, opacity: 0.95, lineHeight: 1.45 }}>{titre}</div>}
        <div style={{ display: 'inline-block', marginTop: 12, padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.35)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {t.comiteMention}
        </div>
      </div>

      {biographie && (
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: SKY, marginBottom: 8 }}>{t.biographie}</div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: INK, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{biographie}</p>
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {qr ? (
          <div style={{ background: '#fff', padding: 10, borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <img src={qr} alt={t.qrAlt} style={{ width: 200, height: 200, display: 'block' }} />
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: MUTED }}>{t.badgeIndispo}</p>
        )}
        <p style={{ margin: 0, fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 1.5 }}>{t.badgeTexte}</p>
        {lienBadge && (
          <a href={lienBadge} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 340, minHeight: 48, borderRadius: 14, background: NAVY, color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none' }}>
            {t.ouvrirBadge}
          </a>
        )}
      </div>
    </section>
  )
}
