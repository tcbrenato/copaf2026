// src/utils/generateAttestationPDF.js
//
// PDF de l'attestation de participation COPAF 2026 : A4 paysage, même texte et même mise en page que AttestationView.jsx
// (dessinée sur la grille 1123 x 794 px de l'affichage, convertie en millimètres). Fonctionne dans le navigateur.
//   genererAttestationPDF(att, { langue, origine, cache }) → Promise<Blob>
// `cache` (objet vide partagé) évite de recharger logos, drapeaux et polices pour chaque PDF d'un lot.

import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { civiliteAffichee, nomAffiche, prenomAffiche, urlVerification } from './attestationsConfig'
import { HAUTEUR, LARGEUR, LOGOS, NAVY, OR, TEXTES } from './attestationsTextes'

const MM = 297 / LARGEUR // millimètres par pixel de la grille de l'affichage
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
// couleur mélangée au blanc : équivalent d'une opacité sur fond blanc
const melange = (rgb, opacite) => rgb.map(c => Math.round(255 - (255 - c) * opacite))

function chargerImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function imagePng(src) {
  const img = await chargerImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  canvas.getContext('2d').drawImage(img, 0, 0)
  return { data: canvas.toDataURL('image/png'), l: img.naturalWidth, h: img.naturalHeight }
}

async function imageEnCache(cache, src) {
  if (!(src in cache)) cache[src] = imagePng(src).catch(() => null)
  return cache[src]
}

async function chargerPolice(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Police introuvable : ${url}`)
  const octets = new Uint8Array(await res.arrayBuffer())
  let binaire = ''
  for (let i = 0; i < octets.length; i += 0x8000) binaire += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000))
  return btoa(binaire)
}

async function policesEnCache(cache) {
  if (!cache.polices) {
    cache.polices = Promise.all([chargerPolice('/fonts/OpenSans-Regular.ttf'), chargerPolice('/fonts/OpenSans-Bold.ttf')]).catch(() => null)
  }
  return cache.polices
}

// Ondes déphasées le long d'un côté (relatives, en mm) : même motif guilloché que l'affichage
function pointsOnde(longueurPx, basePx, ampPx, periodePx, phase) {
  const pts = []
  for (let t = 0; t <= longueurPx; t += 3) pts.push([t, basePx + ampPx * Math.sin((t / periodePx) * Math.PI * 2 + phase)])
  return pts
}
function tracerOnde(doc, pts, vertical) {
  const abs = pts.map(([t, d]) => (vertical ? [d * MM, t * MM] : [t * MM, d * MM]))
  const rel = []
  for (let i = 1; i < abs.length; i++) rel.push([abs[i][0] - abs[i - 1][0], abs[i][1] - abs[i - 1][1]])
  doc.lines(rel, abs[0][0], abs[0][1], [1, 1], 'S')
}

export async function genererAttestationPDF(att, { langue, origine = 'https://copaf-ports.com', cache = {} } = {}) {
  const lang = (langue || att.langue) === 'EN' ? 'EN' : 'FR'
  const T = TEXTES[lang]
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape', compress: true })

  // Polices : OpenSans (accents et noms étrangers) ; à défaut, Helvetica
  let sans = 'helvetica'
  const polices = await policesEnCache(cache)
  if (polices) {
    doc.addFileToVFS('OpenSans-Regular.ttf', polices[0]); doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal')
    doc.addFileToVFS('OpenSans-Bold.ttf', polices[1]); doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold')
    sans = 'OpenSans'
  }
  const marine = hex(NAVY)
  const or = hex(OR)

  // ── Cadre et bande guillochée ──
  doc.setDrawColor(...marine); doc.setLineWidth(3 * MM); doc.rect(10 * MM, 10 * MM, (LARGEUR - 20) * MM, (HAUTEUR - 20) * MM)
  doc.setDrawColor(...or); doc.setLineWidth(1 * MM); doc.rect(16 * MM, 16 * MM, (LARGEUR - 32) * MM, (HAUTEUR - 32) * MM)
  const centre = 20 + 13
  doc.setLineWidth(0.9 * MM)
  ;[0, 1, 2].forEach(i => {
    const phase = (2 * Math.PI * i) / 3
    doc.setDrawColor(...(i === 1 ? melange(or, 0.75) : melange(marine, 0.5)))
    tracerOnde(doc, pointsOnde(LARGEUR, centre, 9, 30, phase), false)
    tracerOnde(doc, pointsOnde(LARGEUR, HAUTEUR - centre, 9, 30, phase), false)
    tracerOnde(doc, pointsOnde(HAUTEUR, centre, 9, 30, phase), true)
    tracerOnde(doc, pointsOnde(HAUTEUR, LARGEUR - centre, 9, 30, phase), true)
  })
  const e1 = 20 + 26 + 6
  const e2 = 20 + 26 + 11
  doc.setDrawColor(...or); doc.setLineWidth(1.5 * MM); doc.rect(e1 * MM, e1 * MM, (LARGEUR - 2 * e1) * MM, (HAUTEUR - 2 * e1) * MM)
  doc.setDrawColor(...marine); doc.setLineWidth(0.6 * MM); doc.rect(e2 * MM, e2 * MM, (LARGEUR - 2 * e2) * MM, (HAUTEUR - 2 * e2) * MM)

  // ── Aides de dessin (coordonnées en pixels de la grille d'affichage) ──
  const centreX = LARGEUR / 2
  const texteCentre = (txt, y, taille, { police = sans, style = 'normal', couleur = marine, espacement = 0 } = {}) => {
    doc.setFont(police, style); doc.setFontSize(taille * MM * 2.8346); doc.setTextColor(...couleur)
    if (doc.setCharSpace) doc.setCharSpace(espacement * MM * 2.8346)
    doc.text(txt, centreX * MM, y * MM, { align: 'center', baseline: 'alphabetic' })
    if (doc.setCharSpace) doc.setCharSpace(0)
  }
  const bloc = (txt, y, taille, largeurPx, interligne, opts = {}) => {
    doc.setFont(opts.police || sans, opts.style || 'normal'); doc.setFontSize(taille * MM * 2.8346)
    const lignes = doc.splitTextToSize(txt, largeurPx * MM)
    lignes.forEach((l, i) => texteCentre(l, y + i * interligne, taille, opts))
    return y + lignes.length * interligne
  }

  // ── En-tête : logos ──
  const logos = await Promise.all(LOGOS.map(l => imageEnCache(cache, l.src)))
  const hLogo = 50
  const largeurs = logos.map(l => (l ? (l.l / l.h) * hLogo : 0))
  const total = largeurs.reduce((a, b) => a + b, 0) + 26 * (logos.filter(Boolean).length - 1)
  let x = centreX - total / 2
  logos.forEach((l, i) => {
    if (!l) return
    doc.addImage(l.data, 'PNG', x * MM, 64 * MM, largeurs[i] * MM, hLogo * MM)
    x += largeurs[i] + 26
  })
  texteCentre(T.organisateurs, 64 + hLogo + 18, 11.5, { style: 'bold', couleur: or, espacement: 3 })
  texteCentre(T.conference, 64 + hLogo + 38, 14, { style: 'bold', espacement: 1.5 })

  // ── Titre ──
  texteCentre(T.titre, 190, 29, { police: 'times', style: 'bold', espacement: 0.8 })
  doc.setDrawColor(...or); doc.setLineWidth(2 * MM); doc.line((centreX - 85) * MM, 203 * MM, (centreX + 85) * MM, 203 * MM)
  texteCentre(T.certifie, 232, 19, { police: 'times', style: 'italic' })

  // ── Identité (drapeau, nom, logo de l'autorité si fourni) ──
  const nomComplet = `${civiliteAffichee(att.civilite, lang)} ${prenomAffiche(att.prenom)} ${nomAffiche(att.nom)}`.trim()
  const drapeau = att.pays_iso2 ? await imageEnCache(cache, `https://flagcdn.com/w160/${String(att.pays_iso2).toLowerCase()}.png`) : null
  const logoAutorite = att.logo_url ? await imageEnCache(cache, att.logo_url) : null
  doc.setFont(sans, 'bold'); doc.setFontSize(34 * MM * 2.8346)
  const largeurNom = doc.getTextWidth(nomComplet) / MM
  const hDrapeau = 34
  const lDrapeau = drapeau ? (drapeau.l / drapeau.h) * hDrapeau : 0
  const hLogoAut = 44
  const lLogoAut = logoAutorite ? (logoAutorite.l / logoAutorite.h) * hLogoAut : 0
  const ligneTotale = (drapeau ? lDrapeau + 16 : 0) + largeurNom + (logoAutorite ? lLogoAut + 18 : 0)
  let xi = centreX - ligneTotale / 2
  const yNom = 283
  if (drapeau) {
    doc.addImage(drapeau.data, 'PNG', xi * MM, (yNom - 26) * MM, lDrapeau * MM, hDrapeau * MM)
    doc.setDrawColor(...melange(marine, 0.35)); doc.setLineWidth(1 * MM); doc.rect(xi * MM, (yNom - 26) * MM, lDrapeau * MM, hDrapeau * MM)
    xi += lDrapeau + 16
  }
  doc.setTextColor(...marine); doc.text(nomComplet, xi * MM, yNom * MM, { baseline: 'alphabetic' })
  xi += largeurNom + 18
  if (logoAutorite) doc.addImage(logoAutorite.data, 'PNG', xi * MM, (yNom - 32) * MM, lLogoAut * MM, hLogoAut * MM)

  // Fonction / organisme : intitulé doré, valeur en gras
  const ligneLibelle = (libelle, valeur, y) => {
    doc.setFont(sans, 'bold'); doc.setFontSize(15 * MM * 2.8346)
    const l1 = doc.getTextWidth(libelle) / MM
    const l2 = doc.getTextWidth(valeur || '') / MM
    const x0 = centreX - (l1 + l2) / 2
    doc.setTextColor(...or); doc.text(libelle, x0 * MM, y * MM)
    doc.setTextColor(...marine); doc.text(valeur || '', (x0 + l1) * MM, y * MM)
  }
  ligneLibelle(T.fonction, att.fonction, 318)
  ligneLibelle(T.organisme, att.autorite_portuaire, 342)

  // ── Corps du texte ──
  let y = bloc(T.suivi, 380, 15, 840, 23)
  y = bloc(T.tenue, y + 10, 15, 840, 22)
  texteCentre(T.delivre, y + 16, 18, { police: 'times', style: 'italic' })

  // ── Pied : signatures et QR de vérification ──
  const baseSignature = HAUTEUR - 62 - 44
  const signature = (xGauche, s) => {
    doc.setDrawColor(...marine); doc.setLineWidth(1 * MM); doc.line(xGauche * MM, baseSignature * MM, (xGauche + 290) * MM, baseSignature * MM)
    doc.setFont(sans, 'bold'); doc.setFontSize(14 * MM * 2.8346); doc.setTextColor(...marine); doc.text(s.nom, xGauche * MM, (baseSignature + 20) * MM)
    doc.setFont(sans, 'normal'); doc.setFontSize(12.5 * MM * 2.8346); doc.text(s.role, xGauche * MM, (baseSignature + 38) * MM)
  }
  signature(72, T.signataires[0])
  signature(LARGEUR - 72 - 290, T.signataires[1])
  const qr = await QRCode.toDataURL(urlVerification(att.code, origine), { errorCorrectionLevel: 'H', margin: 1, width: 320, color: { dark: NAVY, light: '#ffffff' } })
  doc.addImage(qr, 'PNG', (centreX - 46) * MM, (HAUTEUR - 62 - 110) * MM, 92 * MM, 92 * MM)
  doc.setFont(sans, 'normal'); doc.setFontSize(11.5 * MM * 2.8346)
  const lNum = doc.getTextWidth(T.numero) / MM
  doc.setFont(sans, 'bold')
  const lCode = doc.getTextWidth(att.code) / MM
  const x0 = centreX - (lNum + lCode) / 2
  doc.setFont(sans, 'normal'); doc.setTextColor(...marine); doc.text(T.numero, x0 * MM, (HAUTEUR - 62 - 6) * MM)
  doc.setFont(sans, 'bold'); doc.text(att.code, (x0 + lNum) * MM, (HAUTEUR - 62 - 6) * MM)

  doc.setProperties({ title: `${T.titre} - ${att.code}`, author: 'COPAF 2026', subject: att.code })
  return doc.output('blob')
}
