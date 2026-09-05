// src/utils/generateConfirmationInscriptionPDF.js
//
// Genere la "Confirmation d'inscription" COPAF 2026.
//
// FR : superpose les champs variables sur le design fixe fourni (fond A4
// complet, coordonnees Canva en cm), sur le meme principe que l'overlay
// Canvas utilise pour les badges (generateBadge.js) — sauf qu'ici la sortie
// est un vrai PDF (jsPDF).
//
// EN : pas de fond Canva traduit disponible -> page dessinee nativement en
// jsPDF, dans le style "ATTESTATION" deja etabli par generateRecapPDF.js
// (bandeau navy, encadre, logo CRF Perfection), pour rester coherent avec
// le reste de la suite documentaire sans dupliquer du texte francais dans
// un document cense etre en anglais.
//
// Poids du fichier : le fond est reencode en JPEG (au lieu du PNG d'origine)
// avant d'etre integre au PDF — jsPDF stocke une image PNG fournie comme
// bitmap brut si on ne precise pas de compression, ce qui produisait un
// PDF de ~8,5 Mo pour un fond de ~380 Ko. Le JPEG est compresse par
// nature (DCTDecode), donc ce probleme ne se pose plus.

import jsPDF from 'jspdf'

const PAGE_CM = { w: 21, h: 29.7 } // A4
const PT_PER_CM = 28.3465
const FIELD_COLOR = [0, 0, 173] // #0000AD
const NAVY = [0, 14, 145]
const BLUE = [0, 115, 244]
const GRAY = [100, 116, 139]
const DARK = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]

const BACKGROUND_SRC = '/confirmation-inscription-bg.png'
const FONT_REGULAR_SRC = '/fonts/Poppins-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/Poppins-Bold.ttf'
const LOGO_SRC = '/crflogo.png'

// Lieu d'emission fixe (demande explicite : toujours "Washington DC", plus
// jamais configurable ni deduit du dossier).
const EMISSION_VILLE = 'Washington DC'

// ── Positions des champs FR, telles que lues dans le design Canva (cm,
// depuis le coin haut-gauche de la page A4) ──
const FIELDS_CM = {
  lieuDate:  { x: 11.57, y: 4.71,  w: 7.38,  h: 0.54 },
  reference: { x: 2.1,   y: 6.26,  w: 6.17,  h: 0.54 },
  identite:  { x: 3.18,  y: 13.38, w: 17.09, h: 0.79 },
  organisme: { x: 3.18,  y: 14.44, w: 17.09, h: 0.79 },
  passeport: { x: 3.18,  y: 15.33, w: 17.09, h: 0.79 },
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

// Embarque Poppins dans le PDF si les fichiers sont accessibles ; sinon on
// retombe silencieusement sur Helvetica (jamais bloquant — meme filet de
// securite que le reste des generateurs du projet).
async function tryEmbedPoppins(doc) {
  try {
    const [regular, bold] = await Promise.all([
      loadFontBase64(FONT_REGULAR_SRC),
      loadFontBase64(FONT_BOLD_SRC),
    ])
    doc.addFileToVFS('Poppins-Regular.ttf', regular)
    doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal')
    doc.addFileToVFS('Poppins-Bold.ttf', bold)
    doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold')
    return true
  } catch {
    return false
  }
}

// Reencode le fond en JPEG (voir note de poids en tete de fichier).
async function loadBackgroundAsJPEG(src, quality = 0.85) {
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

async function loadLogoCompressed(src, targetHeightPx = 220) {
  const img = await loadImage(src)
  const ratio = img.width / img.height
  const targetWidthPx = Math.round(targetHeightPx * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = targetWidthPx
  canvas.height = targetHeightPx
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, targetWidthPx, targetHeightPx)
  return { dataUrl: canvas.toDataURL('image/png'), ratio }
}

// Mesure la largeur totale d'une suite de runs (texte + poids de police),
// pour reduire la taille de police jusqu'a ce que l'ensemble tienne dans
// la largeur de la case.
function fitRunsFontSize(doc, runs, fontFamily, maxWidthCm, startPt, minPt = 7) {
  let size = startPt
  const widthAt = s => {
    doc.setFontSize(s)
    return runs.reduce((sum, r) => {
      doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
      return sum + doc.getTextWidth(r.text)
    }, 0)
  }
  while (widthAt(size) > maxWidthCm && size > minPt) size -= 0.5
  return size
}

// Dessine une ligne composee de plusieurs runs (label en graisse normale,
// valeurs en gras), verticalement centree dans sa case (baseline 'middle'
// — insensible aux metriques exactes de la police), alignee a gauche.
function drawRuns(doc, runs, box, { fontFamily, maxPt = 14 } = {}) {
  const startPt = Math.min(maxPt, box.h * PT_PER_CM * 0.72)
  const size = fitRunsFontSize(doc, runs, fontFamily, box.w, startPt)
  doc.setFontSize(size)
  doc.setTextColor(...FIELD_COLOR)
  let x = box.x
  const yMid = box.y + box.h / 2
  runs.forEach(r => {
    doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
    doc.text(r.text, x, yMid, { align: 'left', baseline: 'middle' })
    x += doc.getTextWidth(r.text)
  })
}

function drawField(doc, text, box, opts) {
  drawRuns(doc, [{ text, bold: false }], box, opts)
}

function fmtDateJJMMAAAA(d = new Date()) {
  const jj = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const aaaa = d.getFullYear()
  return `${jj}/${mm}/${aaaa}`
}

function fmtDateLongEN(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Nettoie un nom pour un usage dans un nom de fichier (retire accents,
// espaces et caracteres speciaux problematiques).
function sanitizeFilenamePart(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
}

function identiteRuns(form) {
  return [
    { text: '•  M. / Mme : ', bold: false },
    { text: `${form.prenom || ''} ${form.nom || ''}`.trim(), bold: true },
    { text: ' - ', bold: false },
    { text: form.poste || '', bold: true },
  ]
}

// ══════════════════════════════════════════
// FR — overlay sur le design fixe fourni
// ══════════════════════════════════════════
async function buildFR(doc, { form, dossier, numeroPasseport }) {
  const fontLoaded = await tryEmbedPoppins(doc)
  const fontFamily = fontLoaded ? 'Poppins' : 'helvetica'

  const backgroundJpeg = await loadBackgroundAsJPEG(BACKGROUND_SRC)
  doc.addImage(backgroundJpeg, 'JPEG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  drawField(doc, `${EMISSION_VILLE}, le ${fmtDateJJMMAAAA()}`, FIELDS_CM.lieuDate, { fontFamily })
  drawField(doc, `Réf : ${dossier}`, FIELDS_CM.reference, { fontFamily })
  drawRuns(doc, identiteRuns(form), FIELDS_CM.identite, { fontFamily })
  drawRuns(doc, [{ text: '•  Organisme : ', bold: false }, { text: form.organisation || '', bold: true }], FIELDS_CM.organisme, { fontFamily })
  drawRuns(doc, [{ text: '•  Passeport N° : ', bold: false }, { text: numeroPasseport || '', bold: true }], FIELDS_CM.passeport, { fontFamily })
}

// ══════════════════════════════════════════
// EN — page dessinee nativement (pas de fond Canva traduit disponible),
// style aligne sur la section ATTESTATION de generateRecapPDF.js.
// ══════════════════════════════════════════
async function buildEN(doc, { form, dossier, numeroPasseport }) {
  const fontLoaded = await tryEmbedPoppins(doc)
  const fontFamily = fontLoaded ? 'Poppins' : 'helvetica'
  const M = 2.4
  const contentW = PAGE_CM.w - M * 2
  let y = M

  try {
    const { dataUrl, ratio } = await loadLogoCompressed(LOGO_SRC)
    const logoH = 1.6
    doc.addImage(dataUrl, 'PNG', M, y, logoH * ratio, logoH)
  } catch {
    // pas bloquant si le logo ne charge pas
  }
  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('CRF PERFECTION', PAGE_CM.w - M, y + 0.5, { align: 'right' })
  y += 2.2

  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.05)
  doc.line(M, y, PAGE_CM.w - M, y)
  y += 0.9

  // ── Bandeau titre ──
  doc.setFillColor(...NAVY)
  doc.roundedRect(M, y, contentW, 1.1, 0.15, 0.15, 'F')
  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  doc.text('REGISTRATION CONFIRMATION', PAGE_CM.w / 2, y + 0.72, { align: 'center' })
  y += 1.7

  // ── Lieu + date, reference ──
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...FIELD_COLOR)
  doc.text(`${EMISSION_VILLE}, ${fmtDateLongEN()}`, PAGE_CM.w - M, y, { align: 'right' })
  doc.text(`Ref: ${dossier}`, M, y)
  y += 1.1

  // ── Corps de certification ──
  const bodyText = "I, the undersigned, Dr William ODAH, Chief Executive Officer of CRF Perfection and Director of the Organising Committee of the Conference of African Ports (COPAF 2026), hereby certify that:"
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  const bodyWrapped = doc.splitTextToSize(bodyText, contentW)
  doc.text(bodyWrapped, M, y)
  y += bodyWrapped.length * 0.62 + 0.6

  // ── Encadre identite / organisme / passeport ──
  const rows = [
    [{ text: '•  Mr / Ms: ', bold: false }, { text: `${form.prenom || ''} ${form.nom || ''}`.trim(), bold: true }, { text: ' - ', bold: false }, { text: form.poste || '', bold: true }],
    [{ text: '•  Organisation: ', bold: false }, { text: form.organisation || '', bold: true }],
    [{ text: '•  Passport No: ', bold: false }, { text: numeroPasseport || '', bold: true }],
  ]
  const rowH = 0.85
  const boxH = rows.length * rowH + 0.3
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.03)
  doc.rect(M, y, contentW, boxH, 'FD')
  rows.forEach((runs, i) => {
    drawRuns(doc, runs, { x: M + 0.5, y: y + 0.15 + i * rowH, w: contentW - 1, h: rowH }, { fontFamily, maxPt: 13 })
  })
  y += boxH + 0.9

  // ── Suite du texte ──
  const closingText = "Is officially registered for the Conference of African Ports (COPAF 2026), to be held from 19 to 21 October 2026 at the Port of Casablanca.\nThis registration confirmation letter is issued to serve and to be used for all legal purposes."
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  closingText.split('\n').forEach(line => {
    const wrapped = doc.splitTextToSize(line, contentW)
    doc.text(wrapped, M, y)
    y += wrapped.length * 0.62 + 0.25
  })
  y += 0.6

  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text('Sincerely,', M, y)
  y += 1.3

  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('Organising Committee / COPAF 2026', M, y)
  y += 0.6
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text('Director / Dr Oloutayo ODAH', M, y)

  // ── Pied de page ──
  const fy = PAGE_CM.h - M - 0.3
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.03)
  doc.line(M, fy, PAGE_CM.w - M, fy)
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('CRF Perfection · contact@copaf-ports.com · +229 0169 30 30 19', M, fy + 0.5)
  doc.setTextColor(...BLUE)
  doc.text('www.copaf-ports.com', PAGE_CM.w - M, fy + 0.5, { align: 'right' })
}

/**
 * Genere la Confirmation d'inscription et retourne soit le document jsPDF
 * (download=false), soit declenche directement le telechargement.
 *
 * @param {object} params
 * @param {object} params.form            - { nom, prenom, poste, organisation } du dossier
 * @param {string} params.dossier         - ex: "COPAF2026-45210"
 * @param {string} params.numeroPasseport - stocke en base des la premiere saisie (voir AdminProforma.jsx)
 * @param {'fr'|'en'} [params.lang='fr']
 * @param {boolean} [params.download=true]
 */
export async function generateConfirmationInscriptionPDF({
  form,
  dossier,
  numeroPasseport,
  lang = 'fr',
  download = true,
}) {
  const doc = new jsPDF({ unit: 'cm', format: 'a4', compress: true })

  if (lang === 'en') {
    await buildEN(doc, { form, dossier, numeroPasseport })
  } else {
    await buildFR(doc, { form, dossier, numeroPasseport })
  }

  const nomFichier = `${sanitizeFilenamePart(form.prenom)}${sanitizeFilenamePart(form.nom)}` || dossier

  if (download) {
    doc.save(`Confirmation d'inscription_${nomFichier}${lang === 'en' ? '_EN' : ''}.pdf`)
    return null
  }
  return doc
}
