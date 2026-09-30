// src/utils/generateLettreInvitationPDF.js
//
// Genere la "Lettre d'invitation" COPAF 2026 pour un intervenant, en
// superposant 4 zones de texte sur le fond fourni (public/lettre-invitation-bg.png,
// A4 complet 1414x2000px = 21x29.7cm, en-tete/corps/signature/cachet/pied
// de page deja integres a l'image, jamais redessines ici).
//
// Meme principe que generateConfirmationInscriptionPDF.js et
// generateOrdreMissionPDF.js (overlay jsPDF sur un fond image), avec
// Open Sans (au lieu de Poppins) embarquee pour ce document precis.
//
// Les positions/tailles ci-dessous sont fournies telles quelles (cm depuis
// le coin haut-gauche d'une page A4) - ne pas les "arrondir" ou les
// re-deriver, elles ont ete mesurees sur le design Canva d'origine.

import jsPDF from 'jspdf'

export const PAGE_CM = { w: 21, h: 29.7 }
const PT_PER_CM = 28.3465
export const COULEUR_TEXTE = '#0000AD'
const COULEUR_TEXTE_RGB = [0, 0, 173]

export const FOND = '/lettre-invitation-bg.png'
const FONT_REGULAR_SRC = '/fonts/OpenSans-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/OpenSans-Bold.ttf'

// ── Les 4 zones, telles que mesurees sur le design (cm) ────────────────
export const ZONES_CM = {
  lieuDate:   { x: 12.2,  y: 2.69,  w: 7.2,   h: 0.67 },
  reference:  { x: 1.88,  y: 3.84,  w: 5.7,   h: 0.6 },
  intervenant:{ x: 1.88,  y: 9.46,  w: 17.02, h: 4.53 },
  sejour:     { x: 9.31,  y: 19.59, w: 9.59,  h: 0.91 },
}
const SEJOUR_X_DEPART = 9.12
const MARGE_DROITE_PAGE = 0.95
const INTERVENANT_TAILLE_PT = 15.17
const INTERVENANT_INTERLIGNE_CM = 0.926
const INTERVENANT_TAILLE_MIN_PT = 10

export const CIVILITES = ['', 'M.', 'Mme', 'Dr', 'Pr', 'S.E.M.', 'S.E. Mme', 'Me']

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const jourFr = j => (j === 1 ? '1er' : String(j))

// Date -> "30 septembre 2026" (jour en toutes lettres avec 1er, mois et annee).
export function formatDateLettresFr(date) {
  if (!date) return ''
  return `${jourFr(date.getDate())} ${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`
}

// Periode de sejour : memes mois -> "17 au 23 octobre 2026.", mois differents
// -> "30 septembre au 2 octobre 2026.", annees differentes -> les 2 dates completes.
export function formatSejourFr(debut, fin) {
  if (!debut || !fin) return ''
  if (debut.getFullYear() !== fin.getFullYear()) {
    return `${formatDateLettresFr(debut)} au ${formatDateLettresFr(fin)}.`
  }
  if (debut.getMonth() !== fin.getMonth()) {
    return `${jourFr(debut.getDate())} ${MOIS_FR[debut.getMonth()]} au ${formatDateLettresFr(fin)}.`
  }
  return `${jourFr(debut.getDate())} au ${formatDateLettresFr(fin)}.`
}

// Reference aleatoire a 5 chiffres, unique par lettre (le formulaire permet
// d'en regenerer une si collision/besoin).
export function genererReference() {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `COPAF2026-${n}`
}

// Les 5 lignes possibles du bloc intervenant, dans l'ordre, avec leur
// graisse (bold: true = toute la ligne en gras). La ligne "nationalite" est
// mixte (labels normaux, valeurs en gras) -> geree a part comme des "runs".
export function lignesIntervenant({ civilite, prenom, nom, fonction, institution, villePays, nationalite, passeport }) {
  const ligneCivilite = [civilite, String(nom || '').toUpperCase().trim(), String(prenom || '').toUpperCase().trim()].filter(Boolean).join(' ').trim()
  const lignes = [
    { runs: ligneCivilite ? [{ text: ligneCivilite, bold: true }] : [] },
    { runs: fonction ? [{ text: fonction, bold: false }] : [] },
    { runs: institution ? [{ text: institution, bold: false }] : [] },
    { runs: villePays ? [{ text: villePays, bold: false }] : [] },
    {
      runs: (nationalite || passeport) ? [
        { text: 'Nationalité : ', bold: false },
        { text: nationalite || '', bold: true },
        { text: '  –  Passeport n° : ', bold: false },
        { text: passeport || '', bold: true },
      ] : [],
    },
  ]
  return lignes.filter(l => l.runs.length > 0)
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

async function loadFontBase64(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Police introuvable : ${url}`)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

async function tryEmbedOpenSans(doc) {
  try {
    const [regular, bold] = await Promise.all([loadFontBase64(FONT_REGULAR_SRC), loadFontBase64(FONT_BOLD_SRC)])
    doc.addFileToVFS('OpenSans-Regular.ttf', regular)
    doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal')
    doc.addFileToVFS('OpenSans-Bold.ttf', bold)
    doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold')
    return true
  } catch {
    return false
  }
}

async function loadBackgroundAsJPEG(src, quality = 0.9) {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  return canvas.toDataURL('image/jpeg', quality)
}

function largeurRuns(doc, runs, fontFamily) {
  return runs.reduce((sum, r) => {
    doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
    return sum + doc.getTextWidth(r.text)
  }, 0)
}

// Zone 1 (lieu/date) et zone sejour : une seule ligne, reduite si besoin,
// centree verticalement (baseline = haut + hauteur/2 + ~1/3 de la taille).
function ecrireLigneCentreeV(doc, runs, box, fontFamily, { taillePt, minPt = 8, centrerH = false, xDepart = null, limiteDroite = null }) {
  if (!runs.length) return
  let size = taillePt
  doc.setFont(fontFamily, runs[0].bold ? 'bold' : 'normal')
  doc.setFontSize(size)
  const limite = limiteDroite != null ? limiteDroite - (xDepart ?? box.x) : box.w
  while (largeurRuns(doc, runs, fontFamily) > limite && size > minPt) { size -= 0.5; doc.setFontSize(size) }
  doc.setTextColor(...COULEUR_TEXTE_RGB)
  const totalW = largeurRuns(doc, runs, fontFamily)
  let x = xDepart != null ? xDepart : (centrerH ? box.x + (box.w - totalW) / 2 : box.x)
  const y = box.y + box.h / 2 + (size / PT_PER_CM) / 3
  runs.forEach(r => {
    doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
    doc.text(r.text, x, y, { align: 'left' })
    x += doc.getTextWidth(r.text)
  })
}

// Zone 3 (bloc intervenant) : jusqu'a 5 lignes sur une grille fixe
// (interligne 0.926cm, taille 15.17pt), recentree verticalement selon le
// nombre reel de lignes non vides. Chaque ligne reduit sa propre taille si
// elle depasse la largeur de la zone (jamais sous 10pt), sans changer sa
// position sur la grille.
function ecrireBlocIntervenant(doc, lignes, box, fontFamily) {
  if (!lignes.length) return
  const n = lignes.length
  const blocH = (n - 1) * INTERVENANT_INTERLIGNE_CM
  let y = box.y + box.h / 2 - blocH / 2 + (INTERVENANT_TAILLE_PT / PT_PER_CM) / 3
  lignes.forEach(({ runs }) => {
    let size = INTERVENANT_TAILLE_PT
    doc.setFont(fontFamily, runs[0].bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    while (largeurRuns(doc, runs, fontFamily) > box.w && size > INTERVENANT_TAILLE_MIN_PT) { size -= 0.5; doc.setFontSize(size) }
    doc.setTextColor(...COULEUR_TEXTE_RGB)
    let x = box.x
    runs.forEach(r => {
      doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
      doc.text(r.text, x, y, { align: 'left' })
      x += doc.getTextWidth(r.text)
    })
    y += INTERVENANT_INTERLIGNE_CM
  })
}

function sanitizeFilenamePart(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '')
}

// ── Apercu en direct (Canvas 2D) — memes ZONES_CM, mais dessine sur un
// <canvas> a la resolution native du fond (1414x2000px) pour un rendu
// instantane a chaque frappe, sans repasser par jsPDF/embarquement de
// police a chaque fois. ──
const PX_PAR_CM = 1414 / PAGE_CM.w
const PX_PAR_PT = (PX_PAR_CM * 2.54) / 72

function largeurRunsCanvas(ctx, runs, famille) {
  return runs.reduce((s, r) => { ctx.font = `${r.bold ? 700 : 400} ${ctx.__taillePx}px ${famille}`; return s + ctx.measureText(r.text).width }, 0)
}

function ligneCanvas(ctx, runs, boxPx, famille, { taillePt, minPt = 8, centrerH = false, xDepart = null, limiteDroitePx = null }) {
  if (!runs.length) return
  let taillePx = taillePt * PX_PAR_PT
  ctx.__taillePx = taillePx
  const limite = limiteDroitePx != null ? limiteDroitePx - (xDepart ?? boxPx.x) : boxPx.w
  while (largeurRunsCanvas(ctx, runs, famille) > limite && taillePx > minPt * PX_PAR_PT) { taillePx -= 1; ctx.__taillePx = taillePx }
  const totalW = largeurRunsCanvas(ctx, runs, famille)
  let x = xDepart != null ? xDepart : (centrerH ? boxPx.x + (boxPx.w - totalW) / 2 : boxPx.x)
  const y = boxPx.y + boxPx.h / 2 + taillePx / 3
  ctx.fillStyle = COULEUR_TEXTE
  ctx.textBaseline = 'alphabetic'
  runs.forEach(r => {
    ctx.font = `${r.bold ? 700 : 400} ${taillePx}px ${famille}`
    ctx.fillText(r.text, x, y)
    x += ctx.measureText(r.text).width
  })
}

function blocIntervenantCanvas(ctx, lignes, boxPx, famille) {
  if (!lignes.length) return
  const interlignePx = INTERVENANT_INTERLIGNE_CM * PX_PAR_CM
  const taillePxDefaut = INTERVENANT_TAILLE_PT * PX_PAR_PT
  const blocH = (lignes.length - 1) * interlignePx
  let y = boxPx.y + boxPx.h / 2 - blocH / 2 + taillePxDefaut / 3
  ctx.fillStyle = COULEUR_TEXTE
  ctx.textBaseline = 'alphabetic'
  lignes.forEach(({ runs }) => {
    let taillePx = taillePxDefaut
    ctx.__taillePx = taillePx
    while (largeurRunsCanvas(ctx, runs, famille) > boxPx.w && taillePx > INTERVENANT_TAILLE_MIN_PT * PX_PAR_PT) { taillePx -= 1; ctx.__taillePx = taillePx }
    let x = boxPx.x
    runs.forEach(r => {
      ctx.font = `${r.bold ? 700 : 400} ${taillePx}px ${famille}`
      ctx.fillText(r.text, x, y)
      x += ctx.measureText(r.text).width
    })
    y += interlignePx
  })
}

// Dessine le fond + les 4 zones sur un canvas deja aux dimensions natives
// (1414x2000). `image` est un HTMLImageElement du fond deja charge (a
// mettre en cache cote appelant, il ne change jamais). `famille` est le nom
// de la police CSS deja chargee dans la page (ex. via un <link> Google
// Fonts) — independant de l'embarquement jsPDF utilise pour le PDF final.
export function dessinerApercu(canvas, image, famille, donnees) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  const zonePx = z => ({ x: z.x * PX_PAR_CM, y: z.y * PX_PAR_CM, w: z.w * PX_PAR_CM, h: z.h * PX_PAR_CM })

  ligneCanvas(ctx, [{ text: `${donnees.lieu || ''}, le ${formatDateLettresFr(donnees.dateLettre)}`, bold: true }], zonePx(ZONES_CM.lieuDate), famille, { taillePt: 10.5, centrerH: true })
  ligneCanvas(ctx, [{ text: `Réf. : ${donnees.reference || ''}`, bold: true }], zonePx(ZONES_CM.reference), famille, { taillePt: 10.5 })
  blocIntervenantCanvas(ctx, lignesIntervenant(donnees), zonePx(ZONES_CM.intervenant), famille)
  ligneCanvas(ctx, [{ text: formatSejourFr(donnees.sejourDebut, donnees.sejourFin), bold: true }], zonePx(ZONES_CM.sejour), famille, {
    taillePt: INTERVENANT_TAILLE_PT, xDepart: SEJOUR_X_DEPART * PX_PAR_CM, limiteDroitePx: (PAGE_CM.w - MARGE_DROITE_PAGE) * PX_PAR_CM,
  })
}

/**
 * @param {object} p
 * @param {string} p.lieu
 * @param {Date}   p.dateLettre
 * @param {string} p.reference
 * @param {string} p.civilite
 * @param {string} p.prenom
 * @param {string} p.nom
 * @param {string} p.fonction
 * @param {string} p.institution
 * @param {string} p.villePays
 * @param {string} p.nationalite
 * @param {string} p.passeport
 * @param {Date}   p.sejourDebut
 * @param {Date}   p.sejourFin
 * @param {boolean} [p.download=true]
 */
export async function generateLettreInvitationPDF(p) {
  const doc = new jsPDF({ unit: 'cm', format: 'a4', compress: true })
  const fontLoaded = await tryEmbedOpenSans(doc)
  const fontFamily = fontLoaded ? 'OpenSans' : 'helvetica'

  const backgroundJpeg = await loadBackgroundAsJPEG(FOND)
  doc.addImage(backgroundJpeg, 'JPEG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  ecrireLigneCentreeV(doc, [{ text: `${p.lieu || ''}, le ${formatDateLettresFr(p.dateLettre)}`, bold: true }], ZONES_CM.lieuDate, fontFamily, { taillePt: 10.5, centrerH: true })
  ecrireLigneCentreeV(doc, [{ text: `Réf. : ${p.reference || ''}`, bold: true }], ZONES_CM.reference, fontFamily, { taillePt: 10.5 })
  ecrireBlocIntervenant(doc, lignesIntervenant(p), ZONES_CM.intervenant, fontFamily)
  ecrireLigneCentreeV(doc, [{ text: formatSejourFr(p.sejourDebut, p.sejourFin), bold: true }], ZONES_CM.sejour, fontFamily, {
    taillePt: INTERVENANT_TAILLE_PT, xDepart: SEJOUR_X_DEPART, limiteDroite: PAGE_CM.w - MARGE_DROITE_PAGE,
  })

  const nomComplet = `${p.nom || ''} ${p.prenom || ''}`.trim() || 'Intervenant'
  doc.setProperties({ title: `Lettre d'invitation COPAF 2026 - ${nomComplet}` })

  const nomFichier = `Lettre_invitation_COPAF2026_${sanitizeFilenamePart(p.nom)}_${sanitizeFilenamePart(p.prenom)}.pdf`

  if (p.download !== false) {
    doc.save(nomFichier)
    return null
  }
  return { doc, nomFichier }
}
