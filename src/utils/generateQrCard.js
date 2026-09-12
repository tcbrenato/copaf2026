// src/utils/generateQrCard.js
//
// Compose une carte QR telechargeable : bandeau coverscopaf.png en haut
// (identite visuelle COPAF 2026) + QR code et infos de la personne en
// dessous. Le QR n'est jamais superpose au bandeau (deja charge en textes
// et logos) — il est place dans une zone blanche separee, pour rester
// lisible quel que soit le contenu du bandeau.
//
// Utilise pour les QR/badges telechargeables des participants (contact
// principal + membres de delegation) et des intervenants.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * @param {object} params
 * @param {string} params.qrDataUrl   - dataURL du QR deja genere (ex. via QRCode.toDataURL)
 * @param {string} params.nomPrenom   - ex. "Babel BALSOMI"
 * @param {string} [params.sousTitre] - ex. fonction/poste ou organisation
 * @param {string} params.dossier     - ex. "INT2026-001" ou "COPAF2026-45210"
 * @param {boolean} [params.download=true]
 * @param {string} [params.fileName]
 */
export async function generateQrCard({ qrDataUrl, nomPrenom, sousTitre, dossier, download = true, fileName }) {
  const [cover, qr] = await Promise.all([loadImage('/coverscopaf.png'), loadImage(qrDataUrl)])

  const width = 720
  const bannerH = Math.round(width * (cover.naturalHeight / cover.naturalWidth))
  const qrSize = 420
  const padding = 32
  const footerH = padding * 2 + qrSize + 100

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = bannerH + footerH
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(cover, 0, 0, width, bannerH)

  const qrX = (width - qrSize) / 2
  const qrY = bannerH + padding
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 26px Arial'
  ctx.fillText(nomPrenom || '', width / 2, qrY + qrSize + 40)

  if (sousTitre) {
    ctx.fillStyle = '#475569'
    ctx.font = '16px Arial'
    ctx.fillText(sousTitre, width / 2, qrY + qrSize + 66)
  }

  ctx.fillStyle = '#000E91'
  ctx.font = 'bold 15px Arial'
  ctx.fillText(dossier || '', width / 2, qrY + qrSize + 92)

  if (!download) return canvas.toDataURL('image/png')

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || `QR-${dossier}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')

  return null
}
