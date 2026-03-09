import { jsPDF } from 'jspdf'

export const generateFacture = (form) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const num = `FAC-2026-${Date.now().toString().slice(-5)}`
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const montant = parseInt(form.participants) * 5000

  // ── FOND HEADER ──
  doc.setFillColor(0, 14, 145)
  doc.rect(0, 0, W, 55, 'F')

  // ── BANDE BLEUE CLAIRE ──
  doc.setFillColor(0, 115, 244)
  doc.rect(0, 52, W, 6, 'F')

  // ── TITRE COPAF ──
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text('COPAF 2026', 20, 28)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(126, 184, 255)
  doc.text('CONFÉRENCE OFFICIELLE DES PORTS AFRICAINS', 20, 36)
  doc.text('Dubaï · 15 – 17 Septembre 2026', 20, 43)

  // ── FACTURE N° (droite) ──
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('FACTURE', W - 20, 24, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(126, 184, 255)
  doc.text(num, W - 20, 31, { align: 'right' })
  doc.text(`Date : ${date}`, W - 20, 38, { align: 'right' })

  // ── INFOS ÉMETTEUR ──
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR', 20, 70)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('CRF PERFECTION', 20, 77)
  doc.text('contact@crfperfection.pro', 20, 83)
  doc.text('www.crfperfection.pro', 20, 89)
  doc.text('+229 01 97 77 57 98  |  +1 (240) 978-4155', 20, 95)

  // ── INFOS CLIENT ──
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('FACTURÉ À', 120, 70)

  doc.setFillColor(248, 249, 255)
  doc.roundedRect(115, 73, 75, 35, 3, 3, 'F')
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.3)
  doc.roundedRect(115, 73, 75, 35, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.setFontSize(10)
  doc.text(`${form.prenom} ${form.nom}`, 120, 81)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.text(form.organisation, 120, 88)
  doc.text(form.poste || '', 120, 94)
  doc.text(form.pays, 120, 100)
  doc.text(form.email, 120, 106)

  // ── SÉPARATEUR ──
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.3)
  doc.line(20, 115, W - 20, 115)

  // ── TABLEAU PRESTATIONS ──
  // En-tête tableau
  doc.setFillColor(0, 14, 145)
  doc.rect(20, 120, W - 40, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('DÉSIGNATION', 25, 127)
  doc.text('QTÉ', 130, 127, { align: 'center' })
  doc.text('P.U.', 155, 127, { align: 'center' })
  doc.text('TOTAL', W - 25, 127, { align: 'right' })

  // Ligne prestation
  doc.setFillColor(248, 249, 255)
  doc.rect(20, 130, W - 40, 14, 'F')
  doc.setTextColor(40, 40, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Formation COPAF 2026 — Dubai', 25, 138)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('3 jours · All-inclusive · Certification internationale', 25, 143)

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(9)
  doc.text(String(form.participants), 130, 138, { align: 'center' })
  doc.text('$5,000', 155, 138, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.text(`$${montant.toLocaleString()}`, W - 25, 138, { align: 'right' })

  // Ligne inclusions
  doc.setFillColor(255, 255, 255)
  doc.rect(20, 144, W - 40, 10, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text('Hébergement · Transferts · Tablette · Pauses-café · Déjeuners', 25, 150)

  // ── SÉPARATEUR ──
  doc.setDrawColor(220, 220, 240)
  doc.setLineWidth(0.3)
  doc.line(20, 158, W - 20, 158)

  // ── TOTAL ──
  doc.setFillColor(0, 14, 145)
  doc.roundedRect(115, 163, 75, 22, 3, 3, 'F')
  doc.setTextColor(126, 184, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('MONTANT TOTAL', 152, 171, { align: 'center' })
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(`$${montant.toLocaleString()}`, 152, 181, { align: 'center' })

  // ── NOTE FISCALE ──
  doc.setFillColor(255, 248, 230)
  doc.roundedRect(20, 163, 88, 22, 3, 3, 'F')
  doc.setDrawColor(255, 180, 0)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, 163, 88, 22, 3, 3, 'S')
  doc.setTextColor(150, 100, 0)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('NB :', 25, 171)
  doc.setFont('helvetica', 'normal')
  const note = 'Tarif net de taxes. Selon votre juridiction fiscale,\nle mécanisme d\'auto-liquidation de la TVA\npeut s\'appliquer.'
  doc.text(note, 33, 171)

  // ── PAIEMENT ──
  doc.setFillColor(248, 249, 255)
  doc.roundedRect(20, 195, W - 40, 30, 3, 3, 'F')
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, 195, W - 40, 30, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 115, 244)
  doc.setFontSize(8)
  doc.text('INSTRUCTIONS DE PAIEMENT', 25, 202)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8)
  doc.text(`Bénéficiaire : CRF PERFECTION`, 25, 209)
  doc.text(`Référence : COPAF2026 + ${form.nom}`, 25, 215)
  doc.text(`Délai : 7 jours après inscription`, 25, 221)
  doc.text(`Mode : Virement bancaire uniquement`, 110, 209)
  doc.text(`Coordonnées bancaires envoyées par email`, 110, 215)

  // ── INCLUSIONS ──
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.setFontSize(8)
  doc.text('CE QUI EST INCLUS', 20, 238)

  const inclusions = [
    '✓ Frais de formation (3 jours)',
    '✓ Hébergement',
    '✓ Transferts aéroport-hôtel',
    '✓ Tablette préchargée',
    '✓ Pauses-café & déjeuners',
    '✓ 2 Certifications internationales',
    '✓ Matériels didactiques',
    '✓ Service conciergerie VIP',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(8)
  inclusions.forEach((item, i) => {
    const col = i < 4 ? 20 : 110
    const row = 244 + (i % 4) * 7
    doc.text(item, col, row)
  })

  // ── FOOTER ──
  doc.setFillColor(0, 14, 145)
  doc.rect(0, 272, W, 25, 'F')
  doc.setFillColor(0, 115, 244)
  doc.rect(0, 270, W, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('COPAF 2026', W / 2, 280, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(126, 184, 255)
  doc.text('copaf-ports.com  ·  contact@crfperfection.pro  ·  +229 01 97 77 57 98', W / 2, 287, { align: 'center' })
  doc.text(`Document généré le ${date} · Réf. ${num}`, W / 2, 293, { align: 'center' })

  // ── TÉLÉCHARGEMENT ──
  doc.save(`Facture_COPAF2026_${form.nom}.pdf`)
}