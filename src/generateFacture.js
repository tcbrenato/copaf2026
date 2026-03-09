import { jsPDF } from 'jspdf'

export const generateFacture = (form) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const num = `FAC-2026-${Date.now().toString().slice(-5)}`
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const montant = parseInt(form.participants) * 5000
  const montantStr = '$' + montant.toLocaleString('en-US')
  const puStr = '$5,000'

  // ── HEADER FOND ──
  doc.setFillColor(0, 14, 145)
  doc.rect(0, 0, W, 52, 'F')
  doc.setFillColor(0, 115, 244)
  doc.rect(0, 49, W, 5, 'F')

  // ── TITRE ──
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('COPAF 2026', 20, 24)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(126, 184, 255)
  doc.text('CONFERENCE OFFICIELLE DES PORTS AFRICAINS', 20, 32)
  doc.text('Dubai  -  15 - 17 Septembre 2026', 20, 39)

  // ── FACTURE N° ──
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('FACTURE', W - 20, 22, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(126, 184, 255)
  doc.text(num, W - 20, 30, { align: 'right' })
  doc.text('Date : ' + date, W - 20, 37, { align: 'right' })

  // ── EMETTEUR ──
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.text('EMETTEUR', 20, 68)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('CRF PERFECTION', 20, 75)
  doc.text('contact@crfperfection.pro', 20, 81)
  doc.text('www.crfperfection.pro', 20, 87)
  doc.text('+229 01 97 77 57 98   |   +1 (240) 978-4155', 20, 93)

  // ── CLIENT BOX ──
  doc.setFillColor(248, 249, 255)
  doc.roundedRect(115, 60, 75, 42, 3, 3, 'F')
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.4)
  doc.roundedRect(115, 60, 75, 42, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 115, 244)
  doc.setFontSize(8)
  doc.text('FACTURE A', 120, 67)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.setFontSize(10)
  doc.text(form.prenom + ' ' + form.nom, 120, 75)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(8.5)
  doc.text(form.organisation || '', 120, 82)
  if (form.poste && form.poste !== 'ffffff') {
    doc.text(form.poste, 120, 88)
  }
  doc.text(form.pays || '', 120, 94)
  doc.text(form.email || '', 120, 100)

  // ── SEPARATEUR ──
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.3)
  doc.line(20, 108, W - 20, 108)

  // ── TABLEAU HEADER ──
  doc.setFillColor(0, 14, 145)
  doc.rect(20, 113, W - 40, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('DESIGNATION', 25, 119)
  doc.text('QTE', 135, 119, { align: 'center' })
  doc.text('P.U.', 158, 119, { align: 'center' })
  doc.text('TOTAL', W - 25, 119, { align: 'right' })

  // ── LIGNE PRESTATION ──
  doc.setFillColor(248, 249, 255)
  doc.rect(20, 122, W - 40, 16, 'F')
  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Formation COPAF 2026 - Dubai', 25, 129)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 100, 100)
  doc.text('3 jours - All-inclusive - Certification internationale', 25, 135)

  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)
  doc.text(String(form.participants), 135, 131, { align: 'center' })
  doc.text(puStr, 158, 131, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.text(montantStr, W - 25, 131, { align: 'right' })

  // ── LIGNE INCLUSIONS ──
  doc.setFillColor(255, 255, 255)
  doc.rect(20, 138, W - 40, 9, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.setFontSize(7.5)
  doc.text('Inclus : Hebergement - Transferts - Tablette - Pauses-cafe - Dejeuners', 25, 144)

  // ── SEPARATEUR ──
  doc.setDrawColor(220, 220, 240)
  doc.setLineWidth(0.3)
  doc.line(20, 150, W - 20, 150)

  // ── TOTAL BOX ──
  doc.setFillColor(0, 14, 145)
  doc.roundedRect(120, 155, 70, 20, 3, 3, 'F')
  doc.setTextColor(126, 184, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('MONTANT TOTAL', 155, 162, { align: 'center' })
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(montantStr, 155, 171, { align: 'center' })

  // ── NOTE FISCALE ──
  doc.setFillColor(255, 248, 230)
  doc.roundedRect(20, 155, 94, 20, 3, 3, 'F')
  doc.setDrawColor(200, 150, 0)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, 155, 94, 20, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 100, 0)
  doc.setFontSize(7.5)
  doc.text('NB :', 25, 162)
  doc.setFont('helvetica', 'normal')
  doc.text('Tarif net de taxes. Selon votre juridiction', 34, 162)
  doc.text('fiscale, le mecanisme d\'auto-liquidation de', 25, 167)
  doc.text('la TVA peut s\'appliquer.', 25, 172)

  // ── PAIEMENT BOX ──
  doc.setFillColor(248, 249, 255)
  doc.roundedRect(20, 182, W - 40, 28, 3, 3, 'F')
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.3)
  doc.roundedRect(20, 182, W - 40, 28, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 115, 244)
  doc.setFontSize(8)
  doc.text('INSTRUCTIONS DE PAIEMENT', 25, 189)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(8)
  doc.text('Beneficiaire : CRF PERFECTION', 25, 196)
  doc.text('Reference : COPAF2026 + ' + form.nom, 25, 202)
  doc.text('Delai : 7 jours apres inscription', 25, 208)
  doc.text('Mode : Virement bancaire uniquement', 115, 196)
  doc.text('Coordonnees bancaires envoyees par email', 115, 202)

  // ── INCLUSIONS ──
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 14, 145)
  doc.setFontSize(8)
  doc.text('CE QUI EST INCLUS', 20, 222)

  const inclusions = [
    'Formation complete (3 jours)',
    'Hebergement',
    'Transferts aeroport-hotel',
    'Tablette precharge',
    'Pauses-cafe & dejeuners',
    '2 Certifications internationales',
    'Materiels didactiques',
    'Service conciergerie VIP',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  doc.setFontSize(8)
  inclusions.forEach((item, i) => {
    const col = i < 4 ? 20 : 110
    const row = 229 + (i % 4) * 7
    doc.text('- ' + item, col, row)
  })

  // ── SEPARATEUR FOOTER ──
  doc.setDrawColor(0, 115, 244)
  doc.setLineWidth(0.5)
  doc.line(0, 258, W, 258)

  // ── FOOTER ──
  doc.setFillColor(0, 14, 145)
  doc.rect(0, 258, W, 39, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('COPAF 2026', W / 2, 268, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(126, 184, 255)
  doc.text('copaf-ports.com   -   contact@crfperfection.pro   -   +229 01 97 77 57 98', W / 2, 275, { align: 'center' })
  doc.text('Document genere le ' + date + '   -   Ref. ' + num, W / 2, 282, { align: 'center' })
  doc.setTextColor(100, 140, 200)
  doc.setFontSize(7)
  doc.text('Ce document est genere automatiquement et constitue une facture officielle.', W / 2, 290, { align: 'center' })

  doc.save('Facture_COPAF2026_' + form.nom + '.pdf')
}