// src/utils/generateProformaPDF.js
//
// Genere la FACTURE PROFORMA officielle CRF Perfection.

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
  ifu: '',
  rccm: 'RCCM RB COT/15-B-13727',
}

const RIB = {
  banque: 'SGBE Bénin',
  iban: 'BJ66 BJ083 01001 00050273980 97',
  bic: 'SGBEBJ BX',
  titulaire: 'COPAF 2026',
}

const PRESTATIONS_INCLUSES = [
  "Accueil à l'aéroport et installation à l'hôtel",
  "Navette Aéroport <-> Hôtel (aller-retour)",
  "Hébergement 4 nuitées en Hôtel 4 étoiles",
  "Petit-déjeuner & déjeuner pendant les 3 jours",
  "Accès aux conférences, ateliers & networking",
  "Visite guidée du port de Casablanca",
  "Tablette pré-chargée avec études de cas",
  "Attestation de participation",
]

function fmtEur(n) {
  const num = Number(n) || 0
  return `${Number.isInteger(num) ? num : num.toFixed(2)} EUR`
}

function fmtDateLong(d = new Date()) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function generateProformaPDF({ form, dossier, nb, total, download = true }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 46
  const contentW = W - M * 2
  let y = 0

  const numero = `PF-${dossier}`
  const prixU = nb > 0 ? total / nb : total
  const FOOTER_TOP = H - 62 // limite haute reservee au pied de page

  const sectionLabel = (text, yy) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MAROON)
    doc.text(text.toUpperCase(), M, yy)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, yy + 5, W - M, yy + 5)
  }

  // ══════════════════════════════════════════
  // EN-TETE
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...MAROON)
  doc.text('CRF', M, 44)
  const crfW = doc.getTextWidth('CRF ', 'helvetica', 20)
  doc.setTextColor(...GOLD)
  doc.text('Perfection', M + crfW, 44)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('Cabinet de Recherche et de Formation', M, 57)

  const bannerW = 200
  const bannerH = 34
  doc.setFillColor(...MAROON)
  doc.rect(W - M - bannerW, 20, bannerW, bannerH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text('FACTURE PROFORMA', W - M - bannerW / 2, 20 + bannerH / 2 + 5, { align: 'center' })

  y = 84
  doc.setDrawColor(...MAROON)
  doc.setLineWidth(1.25)
  doc.line(M, y, W - M, y)
  y += 20

  // ══════════════════════════════════════════
  // EMETTEUR / DESTINATAIRE
  // ══════════════════════════════════════════
  const colGap = 24
  const colW = (contentW - colGap) / 2
  const colX2 = M + colW + colGap

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GOLD)
  doc.text('ÉMETTEUR', M, y)
  doc.text('DESTINATAIRE', colX2, y)
  y += 13

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...DARK)
  doc.text(EMETTEUR.nom, M, y)
  const destText = doc.splitTextToSize(form.organisation || '—', colW)
  doc.text(destText, colX2, y)
  y += 13

  const emetteurLines = [
    EMETTEUR.adresse,
    EMETTEUR.email,
    `${EMETTEUR.tel1}`,
    EMETTEUR.tel2,
    `IFU : ${EMETTEUR.ifu || '—'}`,
    EMETTEUR.rccm,
  ]
  const destLines = [
    `${form.prenom || ''} ${form.nom || ''}`.trim(),
    form.poste || '—',
    form.pays || '—',
    form.email || '—',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  let ey = y
  emetteurLines.forEach(line => { doc.text(line, M, ey); ey += 11.5 })

  let dy = y + (destText.length - 1) * 11.5
  destLines.forEach(line => { doc.text(line, colX2, dy); dy += 11.5 })

  y = Math.max(ey, dy) + 14

  // ══════════════════════════════════════════
  // BANDEAU INFOS
  // ══════════════════════════════════════════
  const infoH = 42
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(M, y, contentW, infoH, 5, 5, 'F')
  const infoColW = contentW / 3
  const infos = [
    ['N° DE PROFORMA', numero],
    ["DATE D'ÉMISSION", fmtDateLong()],
    ['VALIDITÉ', '30 jours'],
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

  // ══════════════════════════════════════════
  // DETAIL DE LA PRESTATION
  // ══════════════════════════════════════════
  sectionLabel('Détail de la prestation', y)
  y += 16

  const colDesc = contentW * 0.48
  const colQte = contentW * 0.14
  const colPU = contentW * 0.18

  doc.setFillColor(...MAROON)
  doc.rect(M, y, contentW, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text('DESCRIPTION', M + 10, y + 14.5)
  doc.text('QTÉ', M + colDesc + colQte / 2, y + 14.5, { align: 'center' })
  doc.text('P.U.', M + colDesc + colQte + colPU / 2, y + 14.5, { align: 'center' })
  doc.text('TOTAL', M + contentW - 10, y + 14.5, { align: 'right' })
  y += 22

  const rowH = 38
  doc.setFillColor(...WHITE)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.rect(M, y, contentW, rowH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text('Frais de participation — COPAF 2026', M + 10, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('Voir prestations incluses ci-dessous', M + 10, y + 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(String(nb), M + colDesc + colQte / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(prixU), M + colDesc + colQte + colPU / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(total), M + contentW - 10, y + 22, { align: 'right' })
  y += rowH + 14

  // ══════════════════════════════════════════
  // TOTAL
  // ══════════════════════════════════════════
  const totalW = 230
  const totalH = 36
  doc.setFillColor(...MAROON)
  doc.roundedRect(W - M - totalW, y, totalW, totalH, 5, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(220, 200, 150)
  doc.text('MONTANT TOTAL TTC', W - M - totalW + 14, y + 16)
  doc.setFontSize(14.5)
  doc.setTextColor(...WHITE)
  doc.text(fmtEur(total), W - M - 14, y + 29, { align: 'right' })
  y += totalH + 20

  // ══════════════════════════════════════════
  // PRESTATIONS INCLUSES
  // ══════════════════════════════════════════
  sectionLabel('Prestations incluses dans ce montant', y)
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

  // ══════════════════════════════════════════
  // RIB
  // ══════════════════════════════════════════
  sectionLabel('Coordonnées bancaires pour règlement', y)
  y += 15

  const ribRows = [['Banque', RIB.banque], ['IBAN', RIB.iban], ['BIC', RIB.bic], ['Titulaire', RIB.titulaire]]
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

  // ══════════════════════════════════════════
  // MENTION LEGALE
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  const mention = doc.splitTextToSize(
    "Ce document est une facture proforma établie à titre indicatif pour faciliter l'autorisation interne du virement par les services financiers du client. Elle ne constitue pas une facture définitive au sens comptable et ne peut être utilisée comme justificatif de paiement. Une facture définitive sera émise après réception effective du règlement.",
    contentW
  )
  doc.text(mention, M, y)
  y += mention.length * 9.5

  // ── Securite anti-chevauchement : si le contenu depasse la zone
  // reservee au pied de page, on ajoute une page plutot que de superposer.
  if (y > FOOTER_TOP - 10) {
    doc.addPage()
  }

  // ══════════════════════════════════════════
  // PIED DE PAGE (toujours en bas de la derniere page)
  // ══════════════════════════════════════════
  const footerY = H - 48
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.line(M, footerY, W - M, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text('Cabinet de Recherche et de Formation Perfection', M, footerY + 14)
  doc.text(EMETTEUR.email, M, footerY + 26)
  doc.text(`${EMETTEUR.tel1}  ·  ${EMETTEUR.tel2}`, W - M, footerY + 14, { align: 'right' })

  if (download) {
    doc.save(`FACTURE_${numero}.pdf`)
    return null
  }
  return doc
}