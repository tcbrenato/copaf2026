// src/utils/generateFactureDefinitivePDF.js
//
// Genere la FACTURE DEFINITIVE (post-paiement), avec numero sequentiel
// officiel. Contrairement a la proforma, ce document constitue une
// veritable piece comptable.
//
// NOTE : layout, positions, couleurs et dimensions strictement identiques
// a la version originale. Seul le texte affiche varie selon `lang` (fr|en).

import jsPDF from 'jspdf'

const MAROON    = [150, 24, 42]
const GOLD      = [173, 141, 63]
const GRAY      = [107, 114, 128]
const DARK      = [17, 24, 39]
const LIGHT_BG  = [249, 250, 251]
const LINE      = [229, 231, 235]
const GREEN_BG  = [240, 253, 244]
const GREEN_TXT = [22, 163, 74]
const BLUE_BG   = [239, 246, 255]
const WHITE     = [255, 255, 255]

const EMETTEUR = {
  nom: 'CRF PERFECTION',
  adresse: 'Cotonou, Bénin',
  email: 'contactcrfperfection@gmail.com',
  tel1: '+229 0169 30 30 19',
  tel2: '+1 (240) 978-4155',
  ifu: '87015034851',
  rccm: 'RCCM RB COT/15-B-13727',
}

const RIB = {
  banque: 'SGBE Bénin',
  iban: 'BJ66 BJ083 01001 00050273980 97',
  bic: 'SGBEBJ BX',
  titulaire: 'COPAF 2026',
}

const PRESTATIONS = {
  fr: [
    "Accueil à l'aéroport et installation à l'hôtel",
    "Navette Aéroport <-> Hôtel (aller-retour)",
    "Hébergement 4 nuitées en Hôtel 4 étoiles",
    "Petit-déjeuner & déjeuner pendant les 3 jours",
    "Accès aux conférences, ateliers & networking",
    "Visite guidée du port de Casablanca",
    "Tablette pré-chargée avec études de cas",
    "Attestation de participation",
  ],
  en: [
    'Airport welcome and hotel check-in',
    'Airport <-> Hotel shuttle (round trip)',
    '4-night stay in a 4-star hotel',
    'Breakfast & lunch throughout the 3 days',
    'Access to conferences, workshops & networking',
    'Guided tour of the Port of Casablanca',
    'Pre-loaded tablet with case studies',
    'Certificate of attendance',
  ],
}

const TXT = {
  fr: {
    tagline: 'Cabinet de Recherche et de Formation',
    bandeau: 'FACTURE',
    emetteur: 'ÉMETTEUR',
    destinataire: 'DESTINATAIRE',
    numFacture: 'N° DE FACTURE',
    dateEmission: "DATE D'ÉMISSION",
    statut: 'STATUT',
    statutReglee: 'RÉGLÉE',
    detailPrestation: 'Détail de la prestation',
    colDescription: 'DESCRIPTION',
    colQte: 'QTÉ',
    colPu: 'P.U.',
    colTotal: 'TOTAL',
    ligneDesc: 'Frais de participation — COPAF 2026',
    ligneSousDesc: 'Voir prestations incluses ci-dessous',
    montantTotalTtc: 'MONTANT TOTAL TTC',
    prestationsIncluses: 'Prestations incluses dans ce montant',
    coordBancaires: 'Réglée par virement bancaire',
    banque: 'Banque', iban: 'IBAN', bic: 'BIC', titulaire: 'Titulaire',
    mention: (numeroFacture) => `Facture définitive n° ${numeroFacture}, émise après réception effective du règlement. Ce document fait office de justificatif de paiement pour la participation à la COPAF 2026.`,
    ifuLabel: 'IFU',
    dateLocale: 'fr-FR',
  },
  en: {
    tagline: 'Research and Training Firm',
    bandeau: 'INVOICE',
    emetteur: 'ISSUER',
    destinataire: 'RECIPIENT',
    numFacture: 'INVOICE NO.',
    dateEmission: 'ISSUE DATE',
    statut: 'STATUS',
    statutReglee: 'PAID',
    detailPrestation: 'Service details',
    colDescription: 'DESCRIPTION',
    colQte: 'QTY',
    colPu: 'UNIT PRICE',
    colTotal: 'TOTAL',
    ligneDesc: 'Participation fee — COPAF 2026',
    ligneSousDesc: 'See included services below',
    montantTotalTtc: 'TOTAL AMOUNT',
    prestationsIncluses: 'Services included in this amount',
    coordBancaires: 'Paid by bank transfer',
    banque: 'Bank', iban: 'IBAN', bic: 'BIC', titulaire: 'Account holder',
    mention: (numeroFacture) => `Final invoice no. ${numeroFacture}, issued upon actual receipt of payment. This document serves as proof of payment for participation in COPAF 2026.`,
    ifuLabel: 'Tax ID',
    dateLocale: 'en-GB',
  },
}

function fmtEur(n) {
  const num = Number(n) || 0
  return `${Number.isInteger(num) ? num : num.toFixed(2)} EUR`
}

function fmtDateLong(d = new Date(), lang = 'fr') {
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
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

/**
 * @param {object} params
 * @param {object} params.form
 * @param {string} params.dossier
 * @param {string} params.numeroFacture - ex: 'FACT-2026-0001'
 * @param {number} params.nb
 * @param {number} params.total
 * @param {'fr'|'en'} [params.lang='fr']
 * @param {boolean} [params.download=true]
 * @param {string} [params.logoSrc='/crflogo.png']
 */
export async function generateFactureDefinitivePDF({ form, dossier, numeroFacture, nb, total, lang = 'fr', download = true, logoSrc = '/crflogo.png' }) {
  const L = TXT[lang] || TXT.fr
  const PRESTATIONS_INCLUSES = PRESTATIONS[lang] || PRESTATIONS.fr
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 46
  const contentW = W - M * 2
  let y = 0

  const prixU = nb > 0 ? total / nb : total
  const FOOTER_TOP = H - 62

  const sectionLabel = (text, yy) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MAROON)
    doc.text(text.toUpperCase(), M, yy)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, yy + 5, W - M, yy + 5)
  }

  // ── En-tete avec logo ──
  let logoH = 0
  try {
    const { dataUrl, ratio } = await loadLogoCompressed(logoSrc)
    const maxLogoH = 46
    logoH = maxLogoH
    const logoW = logoH * ratio
    doc.addImage(dataUrl, 'PNG', M, 14, logoW, logoH)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...MAROON)
    doc.text('CRF', M, 44)
    const crfW = doc.getTextWidth('CRF ', 'helvetica', 20)
    doc.setTextColor(...GOLD)
    doc.text('Perfection', M + crfW, 44)
    logoH = 30
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(L.tagline, M, 14 + logoH + 12)

  const bannerW = 200
  const bannerH = 34
  doc.setFillColor(...MAROON)
  doc.rect(W - M - bannerW, 20, bannerW, bannerH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...WHITE)
  doc.text(L.bandeau, W - M - bannerW / 2, 20 + bannerH / 2 + 5, { align: 'center' })

  y = Math.max(84, 14 + logoH + 22)
  doc.setDrawColor(...MAROON)
  doc.setLineWidth(1.25)
  doc.line(M, y, W - M, y)
  y += 20

  // ── Emetteur / Destinataire ──
  const colGap = 24
  const colW = (contentW - colGap) / 2
  const colX2 = M + colW + colGap

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GOLD)
  doc.text(L.emetteur, M, y)
  doc.text(L.destinataire, colX2, y)
  y += 13

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...DARK)
  doc.text(EMETTEUR.nom, M, y)
  const destText = doc.splitTextToSize(form.organisation || '—', colW)
  doc.text(destText, colX2, y)
  y += 13

  const emetteurLines = [EMETTEUR.adresse, EMETTEUR.email, EMETTEUR.tel1, EMETTEUR.tel2, `${L.ifuLabel} : ${EMETTEUR.ifu}`, EMETTEUR.rccm]
  const destLines = [`${form.prenom || ''} ${form.nom || ''}`.trim(), form.poste || '—', form.pays || '—', form.email || '—']

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  let ey = y
  emetteurLines.forEach(line => { doc.text(line, M, ey); ey += 11.5 })
  let dy = y + (destText.length - 1) * 11.5
  destLines.forEach(line => { doc.text(line, colX2, dy); dy += 11.5 })
  y = Math.max(ey, dy) + 14

  // ── Bandeau infos (numero facture / date / statut) ──
  const infoH = 42
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(M, y, contentW, infoH, 5, 5, 'F')
  const infoColW = contentW / 3
  const infos = [
    [L.numFacture, numeroFacture],
    [L.dateEmission, fmtDateLong(new Date(), lang)],
    [L.statut, L.statutReglee],
  ]
  infos.forEach(([label, value], i) => {
    const x = M + 16 + i * infoColW
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GOLD)
    doc.text(label, x, y + 16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...MAROON)
    doc.text(value, x, y + 32)
  })
  y += infoH + 18

  // ── Detail ──
  sectionLabel(L.detailPrestation, y)
  y += 16

  const colDesc = contentW * 0.48
  const colQte = contentW * 0.14
  const colPU = contentW * 0.18

  doc.setFillColor(...MAROON)
  doc.rect(M, y, contentW, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text(L.colDescription, M + 10, y + 14.5)
  doc.text(L.colQte, M + colDesc + colQte / 2, y + 14.5, { align: 'center' })
  doc.text(L.colPu, M + colDesc + colQte + colPU / 2, y + 14.5, { align: 'center' })
  doc.text(L.colTotal, M + contentW - 10, y + 14.5, { align: 'right' })
  y += 22

  const rowH = 38
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.rect(M, y, contentW, rowH)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(L.ligneDesc, M + 10, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(L.ligneSousDesc, M + 10, y + 28)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(String(nb), M + colDesc + colQte / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(prixU), M + colDesc + colQte + colPU / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(total), M + contentW - 10, y + 22, { align: 'right' })
  y += rowH + 14

  // ── Total ──
  const totalW = 230
  const totalH = 36
  doc.setFillColor(...MAROON)
  doc.roundedRect(W - M - totalW, y, totalW, totalH, 5, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(220, 200, 150)
  doc.text(L.montantTotalTtc, W - M - totalW + 14, y + 16)
  doc.setFontSize(14.5)
  doc.setTextColor(...WHITE)
  doc.text(fmtEur(total), W - M - 14, y + 29, { align: 'right' })
  y += totalH + 20

  // ── Prestations incluses ──
  sectionLabel(L.prestationsIncluses, y)
  y += 15
  const boxPad = 10
  const lineH = 13.5
  const boxH = PRESTATIONS_INCLUSES.length * lineH + boxPad * 2
  doc.setFillColor(...GREEN_BG)
  doc.roundedRect(M, y, contentW, boxH, 5, 5, 'F')
  let py = y + boxPad + 9
  PRESTATIONS_INCLUSES.forEach(item => {
    doc.setFillColor(...GREEN_TXT)
    doc.circle(M + 16, py - 3, 1.8, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text(item, M + 26, py)
    py += lineH
  })
  y += boxH + 16

  // ── RIB (rappel, paiement deja effectue) ──
  sectionLabel(L.coordBancaires, y)
  y += 15
  const ribRows = [[L.banque, RIB.banque], [L.iban, RIB.iban], [L.bic, RIB.bic], [L.titulaire, RIB.titulaire]]
  const ribLineH = 16.5
  const ribH = ribRows.length * ribLineH + 12
  doc.setFillColor(...BLUE_BG)
  doc.roundedRect(M, y, contentW, ribH, 5, 5, 'F')
  let ry = y + 19
  ribRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text(label, M + 16, ry)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MAROON)
    doc.text(value, W - M - 16, ry, { align: 'right' })
    ry += ribLineH
  })
  y += ribH + 16

  // ── Mention legale (facture definitive) ──
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  const mention = doc.splitTextToSize(L.mention(numeroFacture), contentW)
  doc.text(mention, M, y)
  y += mention.length * 9.5

  if (y > FOOTER_TOP - 10) doc.addPage()

  const footerY = H - 48
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.line(M, footerY, W - M, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(lang === 'en' ? 'CRF Perfection — Research and Training Firm' : 'Cabinet de Recherche et de Formation Perfection', M, footerY + 14)
  doc.text(EMETTEUR.email, M, footerY + 26)
  doc.text(`${EMETTEUR.tel1}  ·  ${EMETTEUR.tel2}`, W - M, footerY + 14, { align: 'right' })

  if (download) {
    doc.save(`${numeroFacture}.pdf`)
    return null
  }
  return doc
}