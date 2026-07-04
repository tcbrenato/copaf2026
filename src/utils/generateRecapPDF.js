// src/utils/generateRecapPDF.js
//
// Genere le PDF recapitulatif d'inscription, envoye/telechargeable
// immediatement apres soumission du formulaire, AVANT paiement.
// Utilise jsPDF (deja present dans les dependances du projet).

import jsPDF from 'jspdf'

const NAVY  = [0, 14, 145]   // #000E91
const BLUE  = [0, 115, 244]  // #0073F4
const GRAY  = [100, 116, 139]
const DARK  = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]
const RED   = [220, 38, 38]

const RIB = {
  banque: 'SGBE Benin',
  iban: 'BJ66 BJ083 01001 00050273980 97',
  bic: 'SGBEBJ BX',
  titulaire: 'COPAF 2026',
}

function fmtEur(n) {
  return `${Number(n).toLocaleString('fr-FR')} EUR`
}

function fmtDateNow() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * @param {object} params
 * @param {object} params.form - { nom, prenom, email, telephone, organisation, poste, pays, message }
 * @param {string} params.dossier - ex: 'COPAF2026-45210'
 * @param {number} params.nb - nombre de participants
 * @param {number} params.total - montant total en EUR
 * @param {string} params.paiementMode - 'maintenant' | 'plus_tard'
 * @param {boolean} [params.download=true] - true = declenche le telechargement, false = retourne le doc jsPDF
 */
export function generateRecapPDF({ form, dossier, nb, total, paiementMode, download = true }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 44
  let y = 0

  // ── Bandeau d'en-tete ──
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageWidth, 96, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('COPAF 2026', margin, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(200, 215, 255)
  doc.text('Conference des Ports Africains — Casablanca, Maroc — 15, 16 & 17 Septembre 2026', margin, 58)
  doc.text('Organise par CRF Perfection · Sous l\'egide de l\'AGPAOC · Sous le haut patronage de l\'ANP', margin, 72)

  y = 128

  // ── Titre document ──
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('RECAPITULATIF D\'INSCRIPTION', margin, y)
  y += 10

  doc.setDrawColor(...BLUE)
  doc.setLineWidth(2)
  doc.line(margin, y, margin + 60, y)
  y += 28

  // ── Numero de dossier + statut ──
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 54, 6, 6, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('NUMERO DE DOSSIER', margin + 16, y + 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...NAVY)
  doc.text(dossier, margin + 16, y + 40)

  const statutLabel = paiementMode === 'maintenant' ? 'EN ATTENTE DE REGLEMENT' : 'PLACE RESERVEE'
  const statutColor = paiementMode === 'maintenant' ? [217, 119, 6] : [37, 99, 235]
  const statutWidth = doc.getTextWidth(statutLabel) + 24
  doc.setFillColor(...statutColor)
  doc.roundedRect(pageWidth - margin - statutWidth - 16, y + 15, statutWidth, 24, 12, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(statutLabel, pageWidth - margin - statutWidth - 16 + 12, y + 31)

  y += 80

  // ── Details participant ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('DETAILS DE L\'INSCRIPTION', margin, y)
  y += 18

  const rows = [
    ['Nom complet', `${form.prenom} ${form.nom}`],
    ['Organisation', form.organisation || '—'],
    ['Poste', form.poste || '—'],
    ['Pays', form.pays || '—'],
    ['Email', form.email || '—'],
    ['Telephone', form.telephone || '—'],
    ['Nombre de participants', String(nb)],
    ['Tarif unitaire', fmtEur(3500)],
    ['Montant total', fmtEur(total)],
    ['Mode de paiement', paiementMode === 'maintenant' ? 'Paiement immediat' : 'Reservation differee'],
    ['Date limite de reglement', paiementMode === 'maintenant' ? 'Sous 7 jours ouvrables' : 'Avant le 1er Aout 2026'],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  rows.forEach(([label, value], i) => {
    const rowY = y + i * 22
    if (i % 2 === 0) {
      doc.setFillColor(...LIGHT_BG)
      doc.rect(margin, rowY - 14, pageWidth - margin * 2, 22, 'F')
    }
    doc.setTextColor(...GRAY)
    doc.text(label, margin + 10, rowY)
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.text(String(value), pageWidth - margin - 10, rowY, { align: 'right' })
    doc.setFont('helvetica', 'normal')
  })
  y += rows.length * 22 + 24

  // ── Coordonnees bancaires ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...NAVY)
  doc.text('COORDONNEES BANCAIRES OFFICIELLES', margin, y)
  y += 18

  const ribRows = [
    ['Banque', RIB.banque],
    ['IBAN', RIB.iban],
    ['BIC', RIB.bic],
    ['Titulaire', RIB.titulaire],
  ]
  doc.setFillColor(235, 243, 255)
  doc.roundedRect(margin, y - 14, pageWidth - margin * 2, ribRows.length * 20 + 12, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  ribRows.forEach(([label, value], i) => {
    const rowY = y + i * 20
    doc.setTextColor(...GRAY)
    doc.text(label, margin + 14, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(value, pageWidth - margin - 14, rowY, { align: 'right' })
    doc.setFont('helvetica', 'normal')
  })
  y += ribRows.length * 20 + 26

  // ── Avertissement anti-fraude ──
  doc.setFillColor(255, 251, 235)
  const fraudBoxHeight = 46
  doc.roundedRect(margin, y - 14, pageWidth - margin * 2, fraudBoxHeight, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...RED)
  doc.text('⚠ VERIFICATION ANTI-FRAUDE', margin + 14, y + 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 53, 15)
  doc.text('Ces coordonnees sont les seules valables. Ne payez jamais sur un autre RIB recu par', margin + 14, y + 15)
  doc.text('WhatsApp/email. Verifiez toujours sur copaf-ports.com/verifier avant tout virement.', margin + 14, y + 27)
  y += fraudBoxHeight + 24

  // ── Pied de page ──
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(1)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text(`Document genere le ${fmtDateNow()} — Conditions generales de vente et politique de confidentialite acceptees.`, margin, y)
  y += 14
  doc.text('CRF Perfection · contactcrfperfection@gmail.com', margin, y)
  y += 14
  doc.text('+229 0169 30 30 19  ·  +1 (240) 978-4155', margin, y)
  y += 14
  doc.text('Ce document est un recapitulatif informatif. L\'inscription est confirmee apres reception du paiement.', margin, y)

  if (download) {
    doc.save(`COPAF2026-Recapitulatif-${dossier}.pdf`)
    return null
  }
  return doc
}
