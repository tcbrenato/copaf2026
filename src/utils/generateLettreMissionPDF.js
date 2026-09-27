// src/utils/generateLettreMissionPDF.js
//
// Genere la "Lettre de mission" COPAF 2026 en superposant les champs
// variables sur le fond fourni (public/lettre-mission-bg.png, A4 complet),
// meme principe que generateConfirmationInscriptionPDF.js. Coordonnees des
// champs mesurees par analyse pixel du fond (couleur des cases #EEF5FD),
// en cm depuis le coin haut-gauche d'une page A4 (21 x 29.7 cm).
//
// Signature et cachet du DG sont deja integres au fond (fixes, jamais
// redessines ici) — seuls les champs variables sont ecrits par-dessus.

import jsPDF from 'jspdf'

const PAGE_CM = { w: 21, h: 29.7 }
const FIELD_COLOR = [15, 23, 42] // texte fonce, lisible sur fond bleu tres clair
const CHECK_COLOR = [0, 14, 145] // #000E91

const BACKGROUND = '/lettre-mission-bg.png'
const FONT_REGULAR_SRC = '/fonts/Poppins-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/Poppins-Bold.ttf'

// Champs texte simples (une ligne, verticalement centres dans leur case).
const FIELDS_CM = {
  reference:    { x: 2.926,  y: 3.341,  w: 5.584,  h: 0.49 },
  nom:          { x: 6.312,  y: 8.405,  w: 12.891, h: 0.564 },
  fonction:     { x: 6.312,  y: 9.192,  w: 12.891, h: 0.549 },
  organisation: { x: 6.312,  y: 9.964,  w: 12.891, h: 0.549 },
  nationalite:  { x: 6.312,  y: 10.737, w: 12.891, h: 0.549 },
  passeport:    { x: 6.312,  y: 11.509, w: 12.891, h: 0.564 },
  qualiteAutreBox: { x: 16.678, y: 13.454, w: 2.525, h: 0.49 },
  role:         { x: 1.797,  y: 17.345, w: 17.406, h: 1.262 },
  dateDebut:    { x: 6.312,  y: 19.602, w: 4.173,  h: 0.549 },
  dateFin:      { x: 13.901, y: 19.602, w: 4.173,  h: 0.549 },
  itineraire:   { x: 6.312,  y: 20.523, w: 12.891, h: 0.549 },
  faitA:        { x: 3.134,  y: 25.082, w: 5.228,  h: 0.549 },
  le:           { x: 3.134,  y: 26.002, w: 5.228,  h: 0.549 },
}

// Centres des cases a cocher (cote ~0.36cm), mesures sur le fond.
const CHECKBOXES_CM = {
  qualite: {
    comite:      { x: 1.767,  y: 13.454 },
    equipe:      { x: 6.638,  y: 13.454 },
    intervenant: { x: 11.510, y: 13.454 },
    autre:       { x: 14.895, y: 13.454 },
  },
  frais: {
    transport:    { x: 1.767,  y: 23.107 },
    hebergement:  { x: 6.356,  y: 23.107 },
    restauration: { x: 10.410, y: 23.107 },
    transferts:   { x: 14.465, y: 23.107 },
  },
}

const TXT = {
  fr: {
    fmtDate: d => d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '',
  },
  en: {
    fmtDate: d => d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
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

async function tryEmbedPoppins(doc) {
  try {
    const [regular, bold] = await Promise.all([loadFontBase64(FONT_REGULAR_SRC), loadFontBase64(FONT_BOLD_SRC)])
    doc.addFileToVFS('Poppins-Regular.ttf', regular)
    doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal')
    doc.addFileToVFS('Poppins-Bold.ttf', bold)
    doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold')
    return true
  } catch {
    return false
  }
}

async function loadBackgroundAsJPEG(src, quality = 0.88) {
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

// Ecrit un texte sur une seule ligne, verticalement centre dans sa case,
// reduit la police si necessaire pour tenir dans la largeur.
function drawField(doc, text, box, fontFamily, maxPt = 11) {
  if (!text) return
  let size = Math.min(maxPt, box.h * 28.3465 * 0.65)
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(size)
  while (doc.getTextWidth(text) > box.w - 0.2 && size > 6) { size -= 0.5; doc.setFontSize(size) }
  doc.setTextColor(...FIELD_COLOR)
  doc.text(text, box.x + 0.15, box.y + box.h / 2, { align: 'left', baseline: 'middle' })
}

// Rôle et attributions : plusieurs lignes possibles dans une case plus haute.
function drawMultiline(doc, text, box, fontFamily, pt = 10) {
  if (!text) return
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(pt)
  doc.setTextColor(...FIELD_COLOR)
  const lines = doc.splitTextToSize(text, box.w - 0.3)
  const lineH = pt * 0.0423 // pt -> cm approx pour un interligne confortable
  const maxLines = Math.max(1, Math.floor((box.h - 0.15) / lineH))
  const shown = lines.slice(0, maxLines)
  let y = box.y + 0.18 + lineH * 0.6
  shown.forEach(line => { doc.text(line, box.x + 0.15, y); y += lineH })
}

function drawCheck(doc, point) {
  const s = 0.36
  doc.setDrawColor(...CHECK_COLOR)
  doc.setLineWidth(0.045)
  const x0 = point.x + 0.05, y0 = point.y - s / 2 + 0.05
  doc.line(x0, y0 + s * 0.5, x0 + s * 0.35, y0 + s * 0.85)
  doc.line(x0 + s * 0.35, y0 + s * 0.85, x0 + s * 0.95, y0 + s * 0.1)
}

function sanitizeFilenamePart(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '')
}

/**
 * Genere la Lettre de mission et retourne le doc jsPDF (download=false) ou
 * declenche le telechargement.
 *
 * @param {object} params.personne - { nom, prenom, fonction, organisation, pays, numero_passeport }
 * @param {object} params.mission  - ligne lettres_mission (qualite, qualite_autre, role_attributions,
 *                                    date_debut, date_fin, itineraire, frais_*, reference, lieu_signature)
 * @param {'fr'|'en'} [params.lang='fr']
 * @param {boolean} [params.download=true]
 */
export async function generateLettreMissionPDF({ personne, mission, lang = 'fr', download = true }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'cm', format: 'a4', compress: true })

  const fontLoaded = await tryEmbedPoppins(doc)
  const fontFamily = fontLoaded ? 'Poppins' : 'helvetica'

  const backgroundJpeg = await loadBackgroundAsJPEG(BACKGROUND)
  doc.addImage(backgroundJpeg, 'JPEG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  drawField(doc, mission.reference || '', FIELDS_CM.reference, fontFamily)
  drawField(doc, `${personne.prenom || ''} ${personne.nom || ''}`.trim(), FIELDS_CM.nom, fontFamily)
  drawField(doc, personne.fonction || '', FIELDS_CM.fonction, fontFamily)
  drawField(doc, personne.organisation || '', FIELDS_CM.organisation, fontFamily)
  drawField(doc, personne.pays || '', FIELDS_CM.nationalite, fontFamily)
  drawField(doc, personne.numero_passeport || '', FIELDS_CM.passeport, fontFamily)

  const qualite = mission.qualite || 'intervenant'
  if (CHECKBOXES_CM.qualite[qualite]) drawCheck(doc, CHECKBOXES_CM.qualite[qualite])
  if (qualite === 'autre' && mission.qualite_autre) drawField(doc, mission.qualite_autre, FIELDS_CM.qualiteAutreBox, fontFamily, 9)

  drawMultiline(doc, mission.role_attributions || '', FIELDS_CM.role, fontFamily)

  const dDebut = mission.date_debut ? new Date(mission.date_debut) : null
  const dFin = mission.date_fin ? new Date(mission.date_fin) : null
  drawField(doc, L.fmtDate(dDebut), FIELDS_CM.dateDebut, fontFamily)
  drawField(doc, L.fmtDate(dFin), FIELDS_CM.dateFin, fontFamily)
  drawField(doc, mission.itineraire || '', FIELDS_CM.itineraire, fontFamily)

  if (mission.frais_transport) drawCheck(doc, CHECKBOXES_CM.frais.transport)
  if (mission.frais_hebergement) drawCheck(doc, CHECKBOXES_CM.frais.hebergement)
  if (mission.frais_restauration) drawCheck(doc, CHECKBOXES_CM.frais.restauration)
  if (mission.frais_transferts) drawCheck(doc, CHECKBOXES_CM.frais.transferts)

  drawField(doc, mission.lieu_signature || 'Casablanca', FIELDS_CM.faitA, fontFamily)
  drawField(doc, L.fmtDate(new Date()), FIELDS_CM.le, fontFamily)

  const nomFichier = `${sanitizeFilenamePart(personne.prenom)}${sanitizeFilenamePart(personne.nom)}` || mission.dossier

  if (download) {
    doc.save(`Lettre_de_mission_${nomFichier}${lang === 'en' ? '_EN' : ''}.pdf`)
    return null
  }
  return doc
}
