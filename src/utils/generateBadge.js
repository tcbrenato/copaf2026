// src/utils/generateBadge.js
//
// Genere le badge participant COPAF 2026 en superposant photo + textes
// sur le template PNG (place dans public/), aux coordonnees exactes
// definies dans Canva (en mm), sur le meme principe que le systeme
// de tickets JESLC 2026 deja utilise.

// ── Dimensions de la page Canva (mm) ──
const PAGE_MM = { w: 50, h: 85 }

// ── Positions des elements, telles que lues dans Canva (mm) ──
const POSITIONS_MM = {
  photo:    { x: 14.73, y: 19.81, w: 20.54, h: 20.35 },
  nom:      { x: 4.76,  y: 42.99, w: 40.24, h: 4.82 },
  fonction: { x: 4.76,  y: 49.93, w: 39.64, h: 2.46 },
  dossier:  { x: 11.35, y: 59.03, w: 27.29, h: 2.35 },
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Dessine une image en mode "cover" (comme object-fit: cover) dans un rectangle donne
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const boxRatio = w / h
  let sx, sy, sw, sh

  if (imgRatio > boxRatio) {
    // image plus large que la boite : on rogne les cotes
    sh = img.height
    sw = sh * boxRatio
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    // image plus haute que la boite : on rogne haut/bas
    sw = img.width
    sh = sw / boxRatio
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

// Reduit automatiquement la taille de police pour que le texte tienne dans la largeur donnee
function fitTextFont(ctx, text, maxWidth, maxFontPx, fontFamily = 'Arial', bold = false) {
  let size = maxFontPx
  const weight = bold ? 'bold ' : ''
  do {
    ctx.font = `${weight}${size}px ${fontFamily}`
    if (ctx.measureText(text).width <= maxWidth || size <= 8) break
    size -= 1
  } while (size > 8)
  return size
}

/**
 * Genere le badge et retourne soit un dataURL (download=false),
 * soit declenche directement le telechargement (download=true, defaut).
 *
 * @param {object} params
 * @param {string} params.nomPrenom   - ex: "Jean KOFFI"
 * @param {string} params.fonction    - ex: "Directeur des Operations"
 * @param {string} params.dossier     - ex: "COPAF2026-45210"
 * @param {string} [params.photoSrc]  - URL/dataURL de la photo du participant (optionnel)
 * @param {string} [params.templateSrc='/badge-template.png']
 * @param {boolean} [params.download=true]
 */
export async function generateBadge({
  nomPrenom,
  fonction,
  dossier,
  photoSrc,
  templateSrc = '/badge-template.png',
  download = true,
}) {
  const template = await loadImage(templateSrc)

  const canvas = document.createElement('canvas')
  canvas.width = template.naturalWidth
  canvas.height = template.naturalHeight
  const ctx = canvas.getContext('2d')

  // Fond = template
  ctx.drawImage(template, 0, 0, canvas.width, canvas.height)

  // Ratio pixels/mm calcule depuis l'image reelle (peu importe la resolution d'export)
  const pxPerMmX = canvas.width / PAGE_MM.w
  const pxPerMmY = canvas.height / PAGE_MM.h

  const toPx = (mmBox) => ({
    x: mmBox.x * pxPerMmX,
    y: mmBox.y * pxPerMmY,
    w: mmBox.w * pxPerMmX,
    h: mmBox.h * pxPerMmY,
  })

  // ── Photo ──
  if (photoSrc) {
    try {
      const photo = await loadImage(photoSrc)
      const box = toPx(POSITIONS_MM.photo)
      drawImageCover(ctx, photo, box.x, box.y, box.w, box.h)
    } catch {
      // pas de photo valide : on laisse le fond du template tel quel a cet endroit
    }
  }

  // ── Nom et Prenom ──
  {
    const box = toPx(POSITIONS_MM.nom)
    const fontSize = fitTextFont(ctx, nomPrenom, box.w, box.h * 0.9, 'Arial', true)
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = '#0f172a'
    ctx.textBaseline = 'middle'
    ctx.fillText(nomPrenom, box.x, box.y + box.h / 2)
  }

  // ── Fonction ──
  {
    const box = toPx(POSITIONS_MM.fonction)
    const fontSize = fitTextFont(ctx, fonction, box.w, box.h * 1.6, 'Arial', false)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = '#475569'
    ctx.textBaseline = 'middle'
    ctx.fillText(fonction, box.x, box.y + box.h / 2)
  }

  // ── Numero de dossier ──
  {
    const box = toPx(POSITIONS_MM.dossier)
    const fontSize = fitTextFont(ctx, dossier, box.w, box.h * 1.6, 'Arial', true)
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillStyle = '#000E91'
    ctx.textBaseline = 'middle'
    ctx.fillText(dossier, box.x, box.y + box.h / 2)
  }

  if (!download) {
    return canvas.toDataURL('image/png')
  }

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Badge-${dossier}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')

  return null
}
