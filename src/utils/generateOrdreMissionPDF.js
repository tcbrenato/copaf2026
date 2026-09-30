// src/utils/generateOrdreMissionPDF.js
//
// Genere l'"Ordre de mission" COPAF 2026 pour un membre de l'equipe
// d'organisation, en superposant 3 zones de texte sur le fond fourni
// (public/ordre-mission-bg.png, A4 complet 1414x2000px = 21x29.7cm,
// en-tete/titre/texte fixe/signature/cachet/pied de page deja integres a
// l'image, jamais redessines ici). Meme principe que
// generateLettreInvitationPDF.js (overlay jsPDF + apercu Canvas 2D
// partageant les memes positions), document et regles distincts.
//
// Grille du bloc missionnaire : le consignes donnent les lignes de base
// pour 5 lignes theoriques (8.38/9.28/10.18/11.08/11.98cm, pas 0.90cm) ET
// pour 4 lignes reelles (8.83/9.73/10.63/11.53cm) — la 2e est la 1ere
// decalee de +0.45cm (= (5-4)*0.90/2), ce qui donne la regle generale
// utilisee ici : premiereBaseline(n) = G1 + (5-n)*interligne/2. Verifiee
// exactement contre les 2 jeux de valeurs fournis, ne pas la re-deriver
// autrement (voir instruction "signaler plutot qu'ajuster a l'aveugle").

import jsPDF from 'jspdf'

export const PAGE_CM = { w: 21, h: 29.7 }
const PT_PER_CM = 28.3465

export const NOIR = '#000000'
const NOIR_RGB = [0, 0, 0]
export const ROUGE = '#96131C'
const ROUGE_RGB = [150, 19, 28]

export const FOND = '/ordre-mission-bg.png'
const FONT_REGULAR_SRC = '/fonts/OpenSans-Regular.ttf'
const FONT_BOLD_SRC = '/fonts/OpenSans-Bold.ttf'

export const CIVILITES = ['', 'M.', 'Mme', 'Dr', 'Pr']

const TAILLE_PT = 16
const INTERLIGNE_CM = 0.90
const TAILLE_MIN_BLOC_PT = 11
const G1_BLOC = 8.38 // cm — 1ere ligne de base de la grille theorique a 5 lignes
const N_GRILLE = 5

export const ZONES_CM = {
  bloc:      { x: 2.1,   y: 7.65,  w: 16.34, h: 4.56 },
  periode:   { x: 13.45, y: 12.47, w: 6.26,  h: 0.54 },
  signature: { x: 1.13,  y: 21.56, w: 11.42, h: 0.5 },
}
const PERIODE_BASELINE_CM = 12.88
const SIGNATURE_BASELINE_CM = 22.01

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const jourFr = j => (j === 1 ? '1er' : String(j))

export function formatDateLettresFr(date) {
  if (!date) return ''
  return `${jourFr(date.getDate())} ${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`
}

// "du 17 au 23 octobre 2026," / "du 30 septembre au 2 octobre 2026," —
// virgule finale (pas de point), car la phrase du template continue apres.
// Cas annees differentes non decrit dans les consignes : extension
// minimale et coherente (memes 2 dates completes) plutot qu'un texte
// tronque, sans rien ajouter au gabarit lui-meme.
export function formatPeriodeeFr(depart, retour) {
  if (!depart || !retour) return ''
  if (depart.getFullYear() !== retour.getFullYear()) {
    return `du ${formatDateLettresFr(depart)} au ${formatDateLettresFr(retour)},`
  }
  if (depart.getMonth() !== retour.getMonth()) {
    return `du ${jourFr(depart.getDate())} ${MOIS_FR[depart.getMonth()]} au ${formatDateLettresFr(retour)},`
  }
  return `du ${jourFr(depart.getDate())} au ${formatDateLettresFr(retour)},`
}

// Les 4 lignes possibles du bloc missionnaire (dans l'ordre), ignorant les
// vides. Seul le NOM est mis en majuscules (pas le prenom, contrairement a
// la lettre d'invitation) ; le n° de passeport est mis en majuscules.
export function lignesMissionnaire({ civilite, prenom, nom, fonction, nationalite, passeport }) {
  const ligneCivilite = [civilite, prenom, String(nom || '').toUpperCase().trim()].filter(Boolean).join(' ').trim()
  const lignes = [
    { runs: ligneCivilite ? [{ text: ligneCivilite, bold: true }] : [] },
    { runs: fonction ? [{ text: fonction, bold: false }] : [] },
    { runs: nationalite ? [{ text: 'Nationalité : ', bold: false }, { text: nationalite, bold: true }] : [] },
    { runs: passeport ? [{ text: 'Passeport n° : ', bold: false }, { text: String(passeport).toUpperCase(), bold: true }] : [] },
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
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
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

function premiereBaselineBloc(n) {
  return G1_BLOC + ((N_GRILLE - n) * INTERLIGNE_CM) / 2
}

function largeurRuns(doc, runs, fontFamily) {
  return runs.reduce((s, r) => { doc.setFont(fontFamily, r.bold ? 'bold' : 'normal'); return s + doc.getTextWidth(r.text) }, 0)
}

function ecrireBlocMissionnaire(doc, lignes, box, fontFamily) {
  if (!lignes.length) return
  let y = premiereBaselineBloc(lignes.length)
  lignes.forEach(({ runs }) => {
    let size = TAILLE_PT
    doc.setFont(fontFamily, runs[0].bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    while (largeurRuns(doc, runs, fontFamily) > box.w && size > TAILLE_MIN_BLOC_PT) { size -= 0.5; doc.setFontSize(size) }
    doc.setTextColor(...NOIR_RGB)
    let x = box.x
    runs.forEach(r => {
      doc.setFont(fontFamily, r.bold ? 'bold' : 'normal')
      doc.text(r.text, x, y, { align: 'left' })
      x += doc.getTextWidth(r.text)
    })
    y += INTERLIGNE_CM
  })
}

function ecrireLigneUnique(doc, texte, { x, y, largeurMax, taillePt, minPt, couleurRgb, bold, fontFamily }) {
  if (!texte) return
  let size = taillePt
  doc.setFont(fontFamily, bold ? 'bold' : 'normal')
  doc.setFontSize(size)
  while (doc.getTextWidth(texte) > largeurMax && size > minPt) { size -= 0.5; doc.setFontSize(size) }
  doc.setTextColor(...couleurRgb)
  doc.text(texte, x, y, { align: 'left' })
}

function sanitizeFilenamePart(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '')
}

/**
 * @param {object} p
 * @param {string} p.civilite
 * @param {string} p.prenom
 * @param {string} p.nom
 * @param {string} p.fonction
 * @param {string} p.nationalite
 * @param {string} p.passeport
 * @param {Date}   p.depart
 * @param {Date}   p.retour
 * @param {string} p.lieuSignature
 * @param {Date}   p.dateSignature
 * @param {boolean} [p.download=true]
 */
export async function generateOrdreMissionPDF(p) {
  const doc = new jsPDF({ unit: 'cm', format: 'a4', compress: true })
  const fontLoaded = await tryEmbedOpenSans(doc)
  const fontFamily = fontLoaded ? 'OpenSans' : 'helvetica'

  const backgroundJpeg = await loadBackgroundAsJPEG(FOND)
  doc.addImage(backgroundJpeg, 'JPEG', 0, 0, PAGE_CM.w, PAGE_CM.h)

  ecrireBlocMissionnaire(doc, lignesMissionnaire(p), ZONES_CM.bloc, fontFamily)

  ecrireLigneUnique(doc, formatPeriodeeFr(p.depart, p.retour), {
    x: ZONES_CM.periode.x, y: PERIODE_BASELINE_CM, largeurMax: ZONES_CM.periode.w,
    taillePt: TAILLE_PT, minPt: TAILLE_MIN_BLOC_PT, couleurRgb: ROUGE_RGB, bold: true, fontFamily,
  })

  ecrireLigneUnique(doc, `Fait à ${p.lieuSignature || ''}, le ${formatDateLettresFr(p.dateSignature)}`, {
    x: ZONES_CM.signature.x, y: SIGNATURE_BASELINE_CM, largeurMax: ZONES_CM.signature.w,
    taillePt: TAILLE_PT, minPt: TAILLE_MIN_BLOC_PT, couleurRgb: NOIR_RGB, bold: false, fontFamily,
  })

  const nomComplet = `${p.nom || ''} ${p.prenom || ''}`.trim() || 'Membre équipe'
  doc.setProperties({ title: `Ordre de mission COPAF 2026 - ${nomComplet}` })

  const nomFichier = `Ordre_de_mission_COPAF2026_${sanitizeFilenamePart(p.nom)}_${sanitizeFilenamePart(p.prenom)}.pdf`

  if (p.download !== false) {
    doc.save(nomFichier)
    return null
  }
  return { doc, nomFichier }
}

// ── Apercu en direct (Canvas 2D), memes ZONES_CM/regles que le PDF. ──
const PX_PAR_CM = 1414 / PAGE_CM.w
const PX_PAR_PT = (PX_PAR_CM * 2.54) / 72

function largeurRunsCanvas(ctx, runs, famille, taillePx) {
  return runs.reduce((s, r) => { ctx.font = `${r.bold ? 700 : 400} ${taillePx}px ${famille}`; return s + ctx.measureText(r.text).width }, 0)
}

function blocMissionnaireCanvas(ctx, lignes, boxPx, famille) {
  if (!lignes.length) return
  let y = premiereBaselineBloc(lignes.length) * PX_PAR_CM
  const interlignePx = INTERLIGNE_CM * PX_PAR_CM
  ctx.textBaseline = 'alphabetic'
  lignes.forEach(({ runs }) => {
    let taillePx = TAILLE_PT * PX_PAR_PT
    while (largeurRunsCanvas(ctx, runs, famille, taillePx) > boxPx.w && taillePx > TAILLE_MIN_BLOC_PT * PX_PAR_PT) taillePx -= 1
    ctx.fillStyle = NOIR
    let x = boxPx.x
    runs.forEach(r => {
      ctx.font = `${r.bold ? 700 : 400} ${taillePx}px ${famille}`
      ctx.fillText(r.text, x, y)
      x += ctx.measureText(r.text).width
    })
    y += interlignePx
  })
}

function ligneUniqueCanvas(ctx, texte, { xCm, yCm, largeurMaxCm, taillePt, minPt, couleur, bold, famille }) {
  if (!texte) return
  const x = xCm * PX_PAR_CM
  const y = yCm * PX_PAR_CM
  const largeurMax = largeurMaxCm * PX_PAR_CM
  let taillePx = taillePt * PX_PAR_PT
  const mesurer = () => { ctx.font = `${bold ? 700 : 400} ${taillePx}px ${famille}`; return ctx.measureText(texte).width }
  while (mesurer() > largeurMax && taillePx > minPt * PX_PAR_PT) taillePx -= 1
  ctx.fillStyle = couleur
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${bold ? 700 : 400} ${taillePx}px ${famille}`
  ctx.fillText(texte, x, y)
}

export function dessinerApercu(canvas, image, famille, donnees) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  const zonePx = z => ({ x: z.x * PX_PAR_CM, y: z.y * PX_PAR_CM, w: z.w * PX_PAR_CM, h: z.h * PX_PAR_CM })

  blocMissionnaireCanvas(ctx, lignesMissionnaire(donnees), zonePx(ZONES_CM.bloc), famille)
  ligneUniqueCanvas(ctx, formatPeriodeeFr(donnees.depart, donnees.retour), {
    xCm: ZONES_CM.periode.x, yCm: PERIODE_BASELINE_CM, largeurMaxCm: ZONES_CM.periode.w,
    taillePt: TAILLE_PT, minPt: TAILLE_MIN_BLOC_PT, couleur: ROUGE, bold: true, famille,
  })
  ligneUniqueCanvas(ctx, `Fait à ${donnees.lieuSignature || ''}, le ${formatDateLettresFr(donnees.dateSignature)}`, {
    xCm: ZONES_CM.signature.x, yCm: SIGNATURE_BASELINE_CM, largeurMaxCm: ZONES_CM.signature.w,
    taillePt: TAILLE_PT, minPt: TAILLE_MIN_BLOC_PT, couleur: NOIR, bold: false, famille,
  })
}
