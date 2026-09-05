// src/utils/generateConfirmationInscriptionPDF.js
//
// Genere la "Confirmation d'inscription" COPAF 2026 en superposant les
// champs variables sur le design fixe fourni (fond A4 complet, coordonnees
// Canva en cm), sur le meme principe que l'overlay Canvas utilise pour les
// badges (generateBadge.js) — sauf qu'ici la sortie est un vrai PDF
// (jsPDF).
//
// FR et EN utilisent chacun leur propre fond (memes dimensions/coordonnees,
// juste le texte fixe traduit dans le design), donc les deux partagent
// exactement la meme logique de placement des 5 champs dynamiques.
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

const BACKGROUNDS = {
  fr: '/confirmation-inscription-bg.png',
  en: '/confirmation-inscription-bg-en.png',
}
const FONT_REGULAR_SRC = '/fonts/Poppins-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/Poppins-Bold.ttf'

// Lieu d'emission fixe (demande explicite : toujours "Washington DC", plus
// jamais configurable ni deduit du dossier).
const EMISSION_VILLE = 'Washington DC'

// ── Positions des champs, telles que lues dans le design Canva (cm, depuis
// le coin haut-gauche de la page A4) — identiques pour les 2 fonds FR/EN
// (meme gabarit, texte fixe traduit dans l'image). ──
const FIELDS_CM = {
  lieuDate:  { x: 11.57, y: 4.71,  w: 7.38,  h: 0.54 },
  reference: { x: 2.1,   y: 6.26,  w: 6.17,  h: 0.54 },
  identite:  { x: 3.18,  y: 13.38, w: 17.09, h: 0.79 },
  organisme: { x: 3.18,  y: 14.44, w: 17.09, h: 0.79 },
  passeport: { x: 3.18,  y: 15.33, w: 17.09, h: 0.79 },
}

const TXT = {
  fr: {
    reference: dossier => `Réf : ${dossier}`,
    identite: (prenom, nom, poste) => [
      { text: '•  M. / Mme : ', bold: false },
      { text: `${prenom} ${nom}`.trim(), bold: true },
      { text: ' - ', bold: false },
      { text: poste || '', bold: true },
    ],
    organisme: org => [{ text: '•  Organisme : ', bold: false }, { text: org || '', bold: true }],
    passeport: num => [{ text: '•  Passeport N° : ', bold: false }, { text: num || '', bold: true }],
    fmtDate: d => `le ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
  },
  en: {
    reference: dossier => `Ref: ${dossier}`,
    identite: (prenom, nom, poste) => [
      { text: '•  Mr / Ms: ', bold: false },
      { text: `${prenom} ${nom}`.trim(), bold: true },
      { text: ' - ', bold: false },
      { text: poste || '', bold: true },
    ],
    organisme: org => [{ text: '•  Organisation: ', bold: false }, { text: org || '', bold: true }],
    passeport: num => [{ text: '•  Passport No: ', bold: false }, { text: num || '', bold: true }],
    fmtDate: d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  },
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
function drawRuns(doc, runs, box, fontFamily, maxPt = 14) {
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

// Nettoie un nom pour un usage dans un nom de fichier (retire accents,
// espaces et caracteres speciaux problematiques).
function sanitizeFilenamePart(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
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
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'cm', format: 'a4', compress: true })

  const fontLoaded = await tryEmbedPoppins(doc)
  const fontFamily = fontLoaded ? 'Poppins' : 'helvetica'

  const backgroundJpeg = await loadBackgroundAsJPEG(BACKGROUNDS[lang] || BACKGROUNDS.fr)
  doc.addImage(backgroundJpeg, 'JPEG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  drawRuns(doc, [{ text: `${EMISSION_VILLE}, ${L.fmtDate(new Date())}`, bold: false }], FIELDS_CM.lieuDate, fontFamily)
  drawRuns(doc, [{ text: L.reference(dossier), bold: false }], FIELDS_CM.reference, fontFamily)
  drawRuns(doc, L.identite(form.prenom, form.nom, form.poste), FIELDS_CM.identite, fontFamily)
  drawRuns(doc, L.organisme(form.organisation), FIELDS_CM.organisme, fontFamily)
  drawRuns(doc, L.passeport(numeroPasseport), FIELDS_CM.passeport, fontFamily)

  const nomFichier = `${sanitizeFilenamePart(form.prenom)}${sanitizeFilenamePart(form.nom)}` || dossier

  if (download) {
    doc.save(`Confirmation d'inscription_${nomFichier}${lang === 'en' ? '_EN' : ''}.pdf`)
    return null
  }
  return doc
}
