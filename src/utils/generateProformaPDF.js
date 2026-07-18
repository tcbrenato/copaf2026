// src/utils/generateProformaPDF.js
//
// Genere la FACTURE PROFORMA officielle CRF Perfection, reproduisant
// exactement le modele valide (couleurs maroon/or de la marque CRF
// Perfection, mentions legales IFU/RCCM).

import jsPDF from 'jspdf'

const MAROON   = [150, 24, 42]     // rouge bordeaux CRF Perfection
const GOLD     = [173, 141, 63]    // or/tan CRF Perfection
const GRAY     = [100, 116, 139]
const DARK     = [15, 23, 42]
const LIGHT_BG = [243, 244, 246]
const GREEN_BG = [236, 253, 245]
const GREEN_TXT= [5, 150, 105]
const BLUE_BG  = [235, 243, 255]
const WHITE    = [255, 255, 255]

const EMETTEUR = {
  nom: 'CRF PERFECTION',
  adresse: 'Cotonou, Bénin',
  email: 'contactcrfperfection@gmail.com',
  tel1: '+229 0169 30 30 19',
  tel2: '+1 (240) 978-4155',
  ifu: '', // A COMPLETER — sera renseigne par l'utilisateur
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
  return `${Number(n).toLocaleString('fr-FR')} EUR`
}

function fmtDateLong(d = new Date()) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * @param {object} params
 * @param {object} params.form - { nom, prenom, organisation, poste, pays, email }
 * @param {string} params.dossier
 * @param {number} params.nb
 * @param {number} params.total
 * @param {boolean} [params.download=true]
 */
export function generateProformaPDF({ form, dossier, nb, total, download = true }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 44
  let y = 0

  const numero = `PF-${dossier}`
  const prixU = nb > 0 ? total / nb : total

  // ── En-tete : logo texte + bandeau FACTURE PROFORMA ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...MAROON)
  doc.text('CRF', M, 46)
  doc.setTextColor(...GOLD)
  doc.text('Perfection', M + doc.getTextWidth('CRF ', 'helvetica', 20) + 2, 46)

  const bannerW = 260
  doc.setFillColor(...MAROON)
  doc.rect(W - M - bannerW, 28, bannerW, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...WHITE)
  doc.text('FACTURE PROFORMA', W - M - bannerW / 2, 50, { align: 'center' })

  y = 88

  // ── Bloc Emetteur / Destinataire ──
  const colW = (W - M * 2 - 20) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MAROON)
  doc.text('CRF PERFECTION', M, y)
  doc.text('DESTINATAIRE', M + colW + 20, y)
  y += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text(EMETTEUR.adresse, M, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...DARK)
  doc.text(form.organisation || '—', M + colW + 20, y)
  y += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text(`${EMETTEUR.email} ${EMETTEUR.tel1}`, M, y)
  y += 12
  doc.text(`${EMETTEUR.tel2}`, M, y)

  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text(`À l'attention de : ${form.prenom || ''} ${form.nom || ''}`, M + colW + 20, y - 12)
  doc.text(`${form.poste || ''} - ${form.pays || ''}`, M + colW + 20, y)
  y += 12
  doc.text(form.email || '', M + colW + 20, y)
  y += 12

  doc.text(`IFU : ${EMETTEUR.ifu || '—'}`, M, y)
  y += 12
  doc.text(EMETTEUR.rccm, M, y)
  y += 26

  // ── Bandeau infos (numero, date, validite) ──
  doc.setFillColor(...LIGHT_BG)
  doc.rect(M, y, W - M * 2, 40, 'F')
  const infoColW = (W - M * 2) / 3
  const infos = [
    ['N° DE PROFORMA', numero],
    ["DATE D'ÉMISSION", fmtDateLong()],
    ['VALIDITÉ', '30 jours'],
  ]
  infos.forEach(([label, value], i) => {
    const x = M + 12 + i * infoColW
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GOLD)
    doc.text(label, x, y + 15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...MAROON)
    doc.text(value, x, y + 31)
  })
  y += 60

  // ── Detail de la prestation ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MAROON)
  doc.text('DÉTAIL DE LA PRESTATION', M, y)
  y += 14

  const tableW = W - M * 2
  const colDesc = tableW * 0.5
  const colQte = tableW * 0.15
  const colPU = tableW * 0.15

  doc.setFillColor(...MAROON)
  doc.rect(M, y, tableW, 24, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...WHITE)
  doc.text('DESCRIPTION', M + 10, y + 16)
  doc.text('QTE', M + colDesc + colQte / 2, y + 16, { align: 'center' })
  doc.text('P.U.', M + colDesc + colQte + colPU / 2, y + 16, { align: 'center' })
  doc.text('TOTAL', M + tableW - 10, y + 16, { align: 'right' })
  y += 24

  const rowH = 38
  doc.setFillColor(248, 250, 252)
  doc.rect(M, y, tableW, rowH, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(M, y, tableW, rowH)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text('Frais de participation - COPAF 2026', M + 10, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('Voir prestations incluses ci-dessous', M + 10, y + 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(String(nb), M + colDesc + colQte / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(prixU), M + colDesc + colQte + colPU / 2, y + 22, { align: 'center' })
  doc.text(fmtEur(total), M + tableW - 10, y + 22, { align: 'right' })
  y += rowH + 14

  // ── Total ──
  const totalW = 240
  doc.setFillColor(...MAROON)
  doc.rect(W - M - totalW, y, totalW, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GOLD)
  doc.text('MONTANT TOTAL TTC', W - M - totalW + 12, y + 15)
  doc.setFontSize(15)
  doc.setTextColor(...WHITE)
  doc.text(fmtEur(total), W - M - 12, y + 27, { align: 'right' })
  y += 54

  // ── Prestations incluses ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MAROON)
  doc.text('PRESTATIONS INCLUSES DANS CE MONTANT', M, y)
  y += 12

  const boxH = PRESTATIONS_INCLUSES.length * 15 + 10
  doc.setFillColor(...GREEN_BG)
  doc.rect(M, y, tableW, boxH, 'F')
  let yy = y + 15
  PRESTATIONS_INCLUSES.forEach(item => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...GREEN_TXT)
    doc.text('-', M + 12, yy)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(item, M + 24, yy)
    yy += 15
  })
  y += boxH + 18

  // ── RIB ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MAROON)
  doc.text('COORDONNÉES BANCAIRES POUR RÈGLEMENT', M, y)
  y += 12

  const ribRows = [['Banque', RIB.banque], ['IBAN', RIB.iban], ['BIC', RIB.bic], ['Titulaire', RIB.titulaire]]
  doc.setFillColor(...BLUE_BG)
  doc.rect(M, y, tableW, ribRows.length * 16 + 8, 'F')
  yy = y + 14
  ribRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text(label, M + 12, yy)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GOLD)
    doc.text(value, M + tableW - 12, yy, { align: 'right' })
    yy += 16
  })
  y += ribRows.length * 16 + 8 + 16

  // ── Mention legale ──
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  const mention = doc.splitTextToSize(
    "Ce document est une facture proforma établie à titre indicatif pour faciliter l'autorisation interne du virement par les services financiers du client. Elle ne constitue pas une facture définitive au sens comptable et ne peut être utilisée comme justificatif de paiement. Une facture définitive sera émise après réception effective du règlement.",
    tableW
  )
  doc.text(mention, M, y)
  y += mention.length * 10 + 16

  // ── Pied de page ──
  const footerY = H - 50
  doc.setDrawColor(226, 232, 240)
  doc.line(M, footerY, W - M, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('Cabinet de Recherche et de Formation Perfection - contactcrfperfection@gmail.com', M, footerY + 14)
  doc.text(`${EMETTEUR.tel1} | ${EMETTEUR.tel2}`, W - M, footerY + 14, { align: 'right' })

  if (download) {
    doc.save(`FACTURE_${numero}.pdf`)
    return null
  }
  return doc
}