// src/utils/generateRecapPDF.js
//
// Génère le document officiel de CONFIRMATION D'INSCRIPTION COPAF 2026,
// tenant obligatoirement sur UNE SEULE PAGE.
//
// NOTE : layout, positions, couleurs et dimensions strictement identiques
// a la version originale. Seul le texte affiche varie selon `lang` (fr|en).

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const NAVY     = [0, 14, 145]     // #000E91
const BLUE     = [0, 115, 244]    // #0073F4
const GRAY     = [100, 116, 139]
const DARK     = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]
const RED      = [190, 30, 30]
const GREEN_WA = [37, 211, 102]  // Couleur WhatsApp officielle

const EVENT = {
  nom: 'COPAF 2026',
  titreLong: { fr: 'Conférence des Ports Africains', en: 'Conference of African Ports' },
  dates: { fr: 'Du 15 au 17 Septembre 2026', en: '15 to 17 September 2026' },
  lieu: { fr: 'Casablanca, Royaume du Maroc', en: 'Casablanca, Kingdom of Morocco' },
  organisateur: 'CRF Perfection',
}

const RIB = {
  banque: 'SGBE Bénin',
  iban: 'BJ66 BJ083 01001 00050273980 97',
  bic: 'SGBEBJ BX',
  titulaire: 'COPAF 2026',
}

const CONTACT = {
  structure: 'CRF Perfection',
  email: 'contactcrfperfection@gmail.com',
  tel1: '+229 0169 30 30 19',
  tel2: '+1 (240) 978-4155',
  whatsapp: '+229 69 30 30 19',
  site: 'www.copaf-ports.com',
}

// ── Textes traduits (toutes les chaines affichees dans le PDF) ──
const TXT = {
  fr: {
    organisateurLabel: EVENT.organisateur.toUpperCase(),
    documentOfficiel: 'DOCUMENT OFFICIEL',
    bandeauTitre: "ATTESTATION D'INSCRIPTION",
    statutAttente: 'EN ATTENTE DE RÈGLEMENT',
    statutReserve: 'PLACE RÉSERVÉE',
    objet: 'Objet : Confirmation de votre inscription',
    bonjour: (p, n) => `Bonjour ${p} ${n},`,
    intro: (titreLong, nom) =>
      `Nous avons le plaisir de vous confirmer que votre inscription à la ${titreLong} ` +
      `(${nom}) a bien été enregistrée. Veuillez trouver ci-dessous le récapitulatif officiel de votre dossier.`,
    recapLabels: {
      ref: "Référence d'inscription",
      evenement: 'Événement',
      dateDebut: 'Date de début',
      lieu: 'Lieu',
      participants: 'Nombre de participants',
      montant: 'Montant global dû',
    },
    montantSuffix: (v) => `${v} (à régler par virement bancaire, impérativement avant le 31 août 2026)`,
    coordBancairesTitre: 'Coordonnées bancaires officielles pour règlement',
    banque: 'Banque',
    titulaire: 'Titulaire',
    bic: 'BIC',
    ibanLabel: 'IBAN',
    alertRib1: 'Ne payez jamais sur un autre RIB reçu par un autre canal. Vérifiez sur ',
    alertRibLink: 'copaf-ports.com/verifier',
    prochainesEtapesTitre: 'Prochaines étapes réglementaires',
    etapes: [
      'Transmettez votre preuve de virement par e-mail ou WhatsApp pour validation prioritaire.',
      "Exécutez le règlement par virement bancaire avant la date limite impérative du 31 août 2026.",
      'Votre badge officiel sécurisé et vos accès vous seront envoyés dès confirmation des fonds par la banque.',
    ],
    contactText: `Pour toute assistance administrative, contactez le secrétariat à l'adresse ${CONTACT.email} ou au ${CONTACT.tel1} / ${CONTACT.tel2}.`,
    waBouton: 'Nous contacter sur WhatsApp',
    waMessage: (dossier) => `Bonjour, je vous contacte concernant mon inscription à la COPAF 2026. Référence dossier : ${dossier}`,
    faitA: (date) => `Fait à Cotonou, le ${date}`,
    qrHint: 'Cliquez ou scannez',
    cachetOrg: 'CRF PERFECTION',
    cachetDoc: 'DOCUMENT OFFICIEL',
    cachetEvent: 'COPAF 2026',
    cachetInscrit: (date) => `Inscrit le : ${date}`,
    cordialement: 'Cordialement,',
    equipe: (structure) => `L'équipe ${structure}`,
    footer1: "Ce document est un récapitulatif informatif. L'inscription est confirmée après réception du paiement.",
    footer2: (date) => `Document généré le ${date} — Conditions générales de vente et politique de confidentialité acceptées.`,
  },
  en: {
    organisateurLabel: EVENT.organisateur.toUpperCase(),
    documentOfficiel: 'OFFICIAL DOCUMENT',
    bandeauTitre: 'CERTIFICATE OF REGISTRATION',
    statutAttente: 'PAYMENT PENDING',
    statutReserve: 'SPOT RESERVED',
    objet: 'Subject: Confirmation of your registration',
    bonjour: (p, n) => `Dear ${p} ${n},`,
    intro: (titreLong, nom) =>
      `We are pleased to confirm that your registration for the ${titreLong} ` +
      `(${nom}) has been successfully recorded. Please find below the official summary of your file.`,
    recapLabels: {
      ref: 'Registration reference',
      evenement: 'Event',
      dateDebut: 'Start date',
      lieu: 'Location',
      participants: 'Number of participants',
      montant: 'Total amount due',
    },
    montantSuffix: (v) => `${v} (to be paid by bank transfer, no later than August 31, 2026)`,
    coordBancairesTitre: 'Official bank details for payment',
    banque: 'Bank',
    titulaire: 'Account holder',
    bic: 'BIC',
    ibanLabel: 'IBAN',
    alertRib1: 'Never pay to a different bank account received through another channel. Verify at ',
    alertRibLink: 'copaf-ports.com/verifier',
    prochainesEtapesTitre: 'Next regulatory steps',
    etapes: [
      'Send your proof of transfer by email or WhatsApp for priority validation.',
      'Complete payment by bank transfer no later than the strict deadline of August 31, 2026.',
      'Your secure official badge and access will be sent as soon as the bank confirms the funds.',
    ],
    contactText: `For any administrative assistance, please contact the secretariat at ${CONTACT.email} or at ${CONTACT.tel1} / ${CONTACT.tel2}.`,
    waBouton: 'Contact us on WhatsApp',
    waMessage: (dossier) => `Hello, I am contacting you regarding my COPAF 2026 registration. File reference: ${dossier}`,
    faitA: (date) => `Issued in Cotonou, on ${date}`,
    qrHint: 'Click or scan',
    cachetOrg: 'CRF PERFECTION',
    cachetDoc: 'OFFICIAL DOCUMENT',
    cachetEvent: 'COPAF 2026',
    cachetInscrit: (date) => `Registered on: ${date}`,
    cordialement: 'Best regards,',
    equipe: (structure) => `The ${structure} team`,
    footer1: 'This document is an informational summary. Registration is confirmed upon receipt of payment.',
    footer2: (date) => `Document generated on ${date} — Terms and conditions and privacy policy accepted.`,
  },
}

function fmtEur(n) {
  return `${Number(n).toLocaleString('de-DE')} EUR` 
}

function fmtDateLong(d = new Date(), lang = 'fr') {
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}


export async function generateRecapPDF({ form, dossier, nb, total, paiementMode, lang = 'fr', download = true }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  const M = 34               
  const P = M + 22           
  const contentW = pageWidth - P * 2
  const now = new Date()

  // Construction de l'URL de vérification sécurisée avec l'IBAN pré-rempli
  const verificationUrl = `https://copaf-ports.com/verifier?iban=${encodeURIComponent(RIB.iban)}`
  // URL WhatsApp directe
  const whatsappUrl = `https://wa.me/22969303019?text=${encodeURIComponent(L.waMessage(dossier))}`

  // ── Cadre extérieur ──
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1.4)
  doc.rect(M, M, pageWidth - M * 2, pageHeight - M * 2)
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(0.5)
  doc.rect(M + 5, M + 5, pageWidth - (M + 5) * 2, pageHeight - (M + 5) * 2)

  let y = P + 18

  // ── En-tête ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(L.organisateurLabel, P, y)
  doc.text(L.documentOfficiel, pageWidth - P, y, { align: 'right' })
  y += 8
  doc.setDrawColor(...GRAY)
  doc.setLineWidth(0.4)
  doc.line(P, y, pageWidth - P, y)
  y += 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...NAVY)
  doc.text(EVENT.titreLong[lang] || EVENT.titreLong.fr, P, y)
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...BLUE)
  doc.text(EVENT.nom, P, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(`${EVENT.dates[lang] || EVENT.dates.fr}  —  ${EVENT.lieu[lang] || EVENT.lieu.fr}`, P, y)
  y += 24

  // ── Bandeau titre du document ──
  doc.setFillColor(...NAVY)
  doc.rect(P, y, contentW, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(255, 255, 255)
  doc.text(L.bandeauTitre, P + 12, y + 18.5)



  const statutLabel = paiementMode === 'maintenant' ? L.statutAttente : L.statutReserve
  const statutColor = paiementMode === 'maintenant' ? [217, 119, 6] : [37, 99, 235]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  const statutWidth = doc.getTextWidth(statutLabel) + 16
  doc.setFillColor(...statutColor)
  doc.roundedRect(P + contentW - statutWidth - 8, y + 6, statutWidth, 16, 6, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(statutLabel, P + contentW - statutWidth - 8 + statutWidth / 2, y + 16, { align: 'center' })
  y += 42

  // ── Objet ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(L.objet, P, y)
  y += 22

  // ── Corps du message ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)
  doc.text(L.bonjour(form.prenom, form.nom), P, y)
  y += 18

  const intro = doc.splitTextToSize(
    L.intro(EVENT.titreLong[lang] || EVENT.titreLong.fr, EVENT.nom),
    contentW
  )
  doc.text(intro, P, y)
  y += intro.length * 13 + 18

  // ── Récapitulatif (Date fixe réglementaire pour éviter tout litige) ──
  const montantLabel = L.montantSuffix(fmtEur(total))

  const recap = [
    [L.recapLabels.ref, `N° ${dossier}`],
    [L.recapLabels.evenement, `${EVENT.nom} — ${EVENT.titreLong[lang] || EVENT.titreLong.fr}`],
    [L.recapLabels.dateDebut, EVENT.dates[lang] || EVENT.dates.fr],
    [L.recapLabels.lieu, EVENT.lieu[lang] || EVENT.lieu.fr],
    [L.recapLabels.participants, String(nb)],
    [L.recapLabels.montant, montantLabel],
  ]

  const valueWidth = contentW * 0.58
  let totalTableH = 0
  const preparedRecap = recap.map(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(String(value), valueWidth)
    const rowH = Math.max(20, lines.length * 12 + 8) 
    totalTableH += rowH
    return { label, lines, rowH }
  })

  doc.setFillColor(...LIGHT_BG)
  doc.rect(P, y - 4, contentW, totalTableH + 6, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.rect(P, y - 4, contentW, totalTableH + 6)

  let currentY = y + 10
  preparedRecap.forEach((row, i) => {
    if (i > 0) {
      doc.setDrawColor(226, 232, 240)
      doc.line(P, currentY - 10, P + contentW, currentY - 10)
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...GRAY)
    doc.text(row.label, P + 12, currentY)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(row.lines, P + contentW - 12, currentY, { align: 'right' })
    currentY += row.rowH
  })
  
  y += totalTableH + 26

  // ── Coordonnées bancaires ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...NAVY)
  doc.text(L.coordBancairesTitre, P, y)
  y += 12
  
  doc.setFillColor(235, 243, 255)
  doc.setDrawColor(191, 219, 254)
  doc.setLineWidth(0.8)
  doc.rect(P, y - 8, contentW, 58, 'FD')
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.text(`${L.banque} : ${RIB.banque}`, P + 14, y + 6)
  doc.text(`${L.titulaire} : ${RIB.titulaire}`, P + contentW / 2 + 10, y + 6)
  


  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text(`${L.ibanLabel} : ${RIB.iban}`, P + 14, y + 23)
  doc.text(`${L.bic} : ${RIB.bic}`, P + contentW / 2 + 10, y + 23)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...RED)
  doc.text(L.alertRib1, P + 14, y + 40)
  
  // URL de vérification cliquable
  const textWidthPre = doc.getTextWidth(L.alertRib1)
  doc.setTextColor(...BLUE)
  doc.setFont('helvetica', 'bold')
  doc.text(L.alertRibLink, P + 14 + textWidthPre, y + 40)
  doc.link(P + 14 + textWidthPre, y + 32, doc.getTextWidth(L.alertRibLink), 10, { url: verificationUrl })
  
  y += 66

  // ── Prochaines étapes ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...NAVY)
  doc.text(L.prochainesEtapesTitre, P, y)
  y += 16

  const etapes = L.etapes
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK)
  etapes.forEach((line, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${line}`, contentW - 4)
    doc.text(lines, P, y)
    y += lines.length * 11.5 + 3
  })
  y += 12

  // ── Contact ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  const contactText = L.contactText
  const contactLines = doc.splitTextToSize(contactText, contentW)
  doc.text(contactLines, P, y)
  y += contactLines.length * 11 + 16

  // ── BOUTON CLIQUABLE WHATSAPP ──
  const btnW = 160
  const btnH = 22
  doc.setFillColor(...GREEN_WA)
  doc.roundedRect(P, y, btnW, btnH, 4, 4, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(255, 255, 255)
  doc.text(L.waBouton, P + btnW / 2, y + 14, { align: 'center' })
  doc.link(P, y, btnW, btnH, { url: whatsappUrl })
  
  y += btnH + 28

  // ── Bloc signature, QR CODE et Cachet Numérique ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(L.faitA(fmtDateLong(now, lang)), P, y)
  
  // QR Code interactif (genere localement, sans dependance a une API externe)
  let qrBase64 = null
  try {
    qrBase64 = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#000E91', light: '#FFFFFF' },
    })
  } catch {
    qrBase64 = null
  }
  const qrSize = 52
  const qrX = P + 130



  if (qrBase64) {
    doc.addImage(qrBase64, 'PNG', qrX, y - 10, qrSize, qrSize)
    doc.link(qrX, y - 10, qrSize, qrSize, { url: verificationUrl })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...GRAY)
    doc.text(L.qrHint, qrX + qrSize/2, y + qrSize + 2, { align: 'center' })
  }

  // ── CACHET NUMÉRIQUE OFFICIEL ──
  const stampX = qrX + qrSize + 25
  const stampY = y - 12
  
  doc.saveGraphicsState()
  doc.setCurrentTransformationMatrix(new doc.Matrix(Math.cos(0.07), Math.sin(0.07), -Math.sin(0.07), Math.cos(0.07), stampX, stampY))
  
  doc.setDrawColor(...RED)
  doc.setTextColor(...RED)
  
  doc.setLineWidth(2.2) 
  doc.roundedRect(0, 0, 130, 56, 9, 9, 'D')
  doc.setLineWidth(0.6) 
  doc.roundedRect(3, 3, 124, 50, 7, 7, 'D')
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(L.cachetOrg, 65, 14, { align: 'center' })
  
  doc.setFont('times', 'bold') 
  doc.setFontSize(11)
  doc.text(L.cachetDoc, 65, 27, { align: 'center' })
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(L.cachetEvent, 65, 40, { align: 'center' })
  
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.text(L.cachetInscrit(fmtDateLong(now, lang)), 65, 49, { align: 'center' })
  
  doc.restoreGraphicsState()

  // Bloc de Signature Droite
  const sigX = P + contentW - 120
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(L.cordialement, sigX, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY)
  doc.text(L.equipe(CONTACT.structure), sigX, y + 12)
  doc.text(CONTACT.site, sigX, y + 24)



  // ── Pied de page ──
  const fy = pageHeight - M - 26
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(P, fy, pageWidth - P, fy)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  
  doc.text(L.footer1, P, fy + 10)
  doc.text(L.footer2(fmtDateLong(now, lang)), P, fy + 20)
  
  doc.text(`${EVENT.organisateur} · ${CONTACT.email}`, pageWidth - P, fy + 10, { align: 'right' })
  doc.text(`${CONTACT.tel1} · ${CONTACT.tel2}`, pageWidth - P, fy + 20, { align: 'right' })

  if (download) {
    doc.save(`COPAF2026-Confirmation-${dossier}.pdf`)
    return null
  }
  return doc
}