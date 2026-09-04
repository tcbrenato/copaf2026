// src/utils/generateConfirmationInscriptionPDF.js
//
// Genere la "Confirmation d'inscription" COPAF 2026 en superposant les
// champs variables sur le design fixe (fond A4 complet, coordonnees Canva
// en cm), sur le meme principe que l'overlay Canvas utilise pour les
// badges (generateBadge.js) — sauf qu'ici la sortie est un vrai PDF
// (jsPDF), pour rester dans les memes conventions que generateRecapPDF.js /
// generateProformaPDF.js / generateFactureDefinitivePDF.js.
//
// Tout le texte fixe (titre, formule de certification, mention legale,
// logos, pied de page) fait partie de l'image de fond — on ne dessine ici
// QUE les 5 champs variables (lieu+date, reference dossier, identite,
// organisme, passeport), en Poppins #0000AD comme specifie dans le design.

import jsPDF from 'jspdf'

const PAGE_CM = { w: 21, h: 29.7 } // A4
const PT_PER_CM = 28.3465
const FIELD_COLOR = [0, 0, 173] // #0000AD

const BACKGROUND_SRC = '/confirmation-inscription-bg.png'
const FONT_REGULAR_SRC = '/fonts/Poppins-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/Poppins-Bold.ttf'

// ── Positions des champs, telles que lues dans le design Canva (cm, depuis
// le coin haut-gauche de la page A4) ──
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

// Reduit la taille de police jusqu'a ce que le texte tienne dans la largeur
// de la case (meme logique que fitTextFont dans generateBadge.js, adaptee
// aux unites jsPDF).
function fitFontSize(doc, text, maxWidthCm, startPt, minPt = 7) {
  let size = startPt
  doc.setFontSize(size)
  while (doc.getTextWidth(text) > maxWidthCm && size > minPt) {
    size -= 0.5
    doc.setFontSize(size)
  }
  return size
}

// Dessine un champ dans sa case (x, y, w, h en cm) : police proportionnelle
// a la hauteur de la case, reduite si besoin pour tenir dans la largeur,
// verticalement centree (baseline 'middle' — insensible aux metriques
// exactes de la police), alignee a gauche.
function drawField(doc, text, box, { fontFamily, maxPt = 14 } = {}) {
  const startPt = Math.min(maxPt, box.h * PT_PER_CM * 0.72)
  doc.setFont(fontFamily, 'normal')
  const size = fitFontSize(doc, text, box.w, startPt)
  doc.setFontSize(size)
  doc.setTextColor(...FIELD_COLOR)
  doc.text(text, box.x, box.y + box.h / 2, { align: 'left', baseline: 'middle' })
}

function fmtDateJJMMAAAA(d = new Date()) {
  const jj = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const aaaa = d.getFullYear()
  return `${jj}/${mm}/${aaaa}`
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
 * @param {string} params.numeroPasseport - saisi manuellement par l'admin pour ce document
 * @param {string} [params.ville='Casablanca']
 * @param {boolean} [params.download=true]
 */
export async function generateConfirmationInscriptionPDF({
  form,
  dossier,
  numeroPasseport,
  ville = 'Casablanca',
  download = true,
}) {
  const doc = new jsPDF({ unit: 'cm', format: 'a4' })

  const fontLoaded = await tryEmbedPoppins(doc)
  const fontFamily = fontLoaded ? 'Poppins' : 'helvetica'

  const background = await loadImage(BACKGROUND_SRC)
  doc.addImage(background, 'PNG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  drawField(doc, `${ville}, le ${fmtDateJJMMAAAA()}`, FIELDS_CM.lieuDate, { fontFamily })
  drawField(doc, `Réf : ${dossier}`, FIELDS_CM.reference, { fontFamily })
  drawField(doc, `•  M. / Mme : ${form.prenom || ''} ${form.nom || ''} - ${form.poste || ''}`, FIELDS_CM.identite, { fontFamily })
  drawField(doc, `•  Organisme : ${form.organisation || ''}`, FIELDS_CM.organisme, { fontFamily })
  drawField(doc, `•  Passeport N° : ${numeroPasseport || ''}`, FIELDS_CM.passeport, { fontFamily })

  const nomFichier = `${sanitizeFilenamePart(form.prenom)}${sanitizeFilenamePart(form.nom)}` || dossier

  if (download) {
    doc.save(`Confirmation d'inscription_${nomFichier}.pdf`)
    return null
  }
  return doc
}
