// src/utils/generateRecapPDF.js
//
// Genere le document officiel COPAF 2026, en DEUX SECTIONS clairement
// separees dans le meme PDF (une seule page, individuel ou groupe) :
//
//  1. ATTESTATION D'INSCRIPTION — texte formel au nom du Comite
//     d'Organisation COPAF 2026, qui certifie l'inscription.
//  2. RECAPITULATIF D'INSCRIPTION — partie pratique : reference, montant,
//     coordonnees bancaires, prochaines etapes, contact, QR code de
//     verification.
//
// Un badge "OFFICIEL" encadre en bleu COPAF et la mention "Comite
// d'Organisation COPAF 2026" apparaissent en en-tete.

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const NAVY     = [0, 14, 145]     // #000E91
const BLUE     = [0, 115, 244]    // #0073F4
const GRAY     = [100, 116, 139]
const DARK     = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]
const BLUE_BG  = [235, 243, 255]
const RED      = [190, 30, 30]
const GREEN_WA = [37, 211, 102]

const EVENT = {
  nom: 'COPAF 2026',
  titreLong: { fr: 'Conférence des Ports Africains', en: 'Conference of African Ports' },
  dates: { fr: 'Du 15 au 17 Septembre 2026', en: '15 to 17 September 2026' },
  datesSentence: { fr: 'du 15 au 17 septembre 2026', en: '15 to 17 September 2026' },
  lieu: { fr: 'Casablanca, Royaume du Maroc', en: 'Casablanca, Kingdom of Morocco' },
  organisateur: 'CRF Perfection',
}

const RIB = {
  banque: 'Société Générale Bénin (SGB)',
  iban: 'BJ66 BJ10 4001 0003 7628 1201 0162',
  bic: 'SOGEBJBJ',
  titulaire: 'CRF PERFECTION',
}

const CONTACT = {
  structure: 'CRF Perfection',
  email: 'contact@copaf-ports.com',
  emailAlt: 'contactcrfperfection@gmail.com',
  tel1: '+229 0169 30 30 19',
  tel2: '+1 (240) 978-4155',
  whatsapp: '+229 69 30 30 19',
  site: 'www.copaf-ports.com',
}

const TXT = {
  fr: {
    organisateurLabel: EVENT.organisateur.toUpperCase(),
    officielBadge: 'OFFICIEL',
    comiteOrganisation: "COMITÉ D'ORGANISATION COPAF 2026",

    // ── Section 1 : Attestation ──
    attestationBandeau: "ATTESTATION D'INSCRIPTION",
    attestationIndiv: (prenom, nom, organisation, titreLong, datesSentence, lieu) =>
      `Le Comité d'Organisation de la COPAF 2026 atteste de la pré-inscription de M/Mme : ${prenom} ${nom}` +
      `${organisation ? ` (venant de : ${organisation})` : ''} à la ${titreLong} (COPAF 2026), ` +
      `qui se tiendra ${datesSentence} à ${lieu}.`,
    attestationGroupe: (delegation, nb, titreLong, datesSentence, lieu) =>
      `Le Comité d'Organisation de la COPAF 2026 atteste de la pré-inscription de la délégation de ${delegation}, ` +
      `composée de ${nb} participants, à la ${titreLong} (COPAF 2026), qui se tiendra ${datesSentence} à ${lieu}.`,
    attestationSignature: "Le Comité d'Organisation",

    // ── Section 2 : Recapitulatif ──
    recapBandeau: 'RÉCAPITULATIF D\'INSCRIPTION',
    statutAttente: 'EN ATTENTE DE RÈGLEMENT',
    statutReserve: 'PLACE RÉSERVÉE',

    tableHeader: {
      dossier: 'N° Dossier',
      participant: 'Participant',
      fonction: 'Titre / Fonction',
      tarif: 'Tarif unitaire',
    },

    recapLabels: {
      ref: 'Référence principale',
      evenement: 'Événement',
      participants: 'Total participants',
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
      'Vos badges officiels sécurisés et vos accès vous seront envoyés dès confirmation des fonds par la banque.',
    ],
    contactText: `Pour toute assistance administrative, contactez le secrétariat à l'adresse ${CONTACT.email} ou au ${CONTACT.tel1} / ${CONTACT.tel2}.`,
    waBouton: 'Nous contacter sur WhatsApp',
    waMessage: (dossier) => `Bonjour, je vous contacte concernant l'inscription COPAF 2026. Référence dossier : ${dossier}`,
    faitA: (date) => `Fait à Cotonou, le ${date}`,
    qrHint: 'Cliquez ou scannez pour vérifier',
    cordialement: 'Cordialement,',
    equipe: (structure) => `L'équipe ${structure}`,
    footer1: "Ce document est un récapitulatif informatif. L'inscription est confirmée après réception du paiement.",
    footer2: (date) => `Document généré le ${date} — Conditions générales de vente et politique de confidentialité acceptées.`,
  },
  en: {
    organisateurLabel: EVENT.organisateur.toUpperCase(),
    officielBadge: 'OFFICIAL',
    comiteOrganisation: 'COPAF 2026 ORGANISING COMMITTEE',

    attestationBandeau: 'CERTIFICATE OF REGISTRATION',
    attestationIndiv: (prenom, nom, organisation, titreLong, datesSentence, lieu) =>
      `The Organising Committee of COPAF 2026 hereby certifies the pre-registration of Mr/Ms: ${prenom} ${nom}` +
      `${organisation ? ` (from: ${organisation})` : ''} for the ${titreLong} (COPAF 2026), ` +
      `to be held ${datesSentence} in ${lieu}.`,
    attestationGroupe: (delegation, nb, titreLong, datesSentence, lieu) =>
      `The Organising Committee of COPAF 2026 hereby certifies the pre-registration of the ${delegation} delegation, ` +
      `comprising ${nb} participants, for the ${titreLong} (COPAF 2026), to be held ${datesSentence} in ${lieu}.`,
    attestationSignature: 'The Organising Committee',

    recapBandeau: 'REGISTRATION SUMMARY',
    statutAttente: 'PAYMENT PENDING',
    statutReserve: 'SPOT RESERVED',

    tableHeader: {
      dossier: 'File No.',
      participant: 'Participant',
      fonction: 'Title / Function',
      tarif: 'Unit Fee',
    },

    recapLabels: {
      ref: 'Main reference',
      evenement: 'Event',
      participants: 'Total participants',
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
      'Your secure official badges and access will be sent as soon as the bank confirms the funds.',
    ],
    contactText: `For any administrative assistance, please contact the secretariat at ${CONTACT.email} or at ${CONTACT.tel1} / ${CONTACT.tel2}.`,
    waBouton: 'Contact us on WhatsApp',
    waMessage: (dossier) => `Hello, I am contacting you regarding the COPAF 2026 registration. File reference: ${dossier}`,
    faitA: (date) => `Issued in Cotonou, on ${date}`,
    qrHint: 'Click or scan to verify',
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

export async function generateRecapPDF({ form, dossier, nb, total, participants = [], delegationName = '', paiementMode, lang = 'fr', download = true }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const M = 34
  const P = M + 22
  const contentW = pageWidth - P * 2
  const now = new Date()

  const verificationUrl = `https://copaf-ports.com/verifier?iban=${encodeURIComponent(RIB.iban)}`
  const whatsappUrl = `https://wa.me/22969303019?text=${encodeURIComponent(L.waMessage(dossier))}`
  const titreLong = EVENT.titreLong[lang] || EVENT.titreLong.fr
  const dates = EVENT.dates[lang] || EVENT.dates.fr
  const datesSentence = EVENT.datesSentence[lang] || EVENT.datesSentence.fr
  const lieu = EVENT.lieu[lang] || EVENT.lieu.fr
  const isGroup = participants && participants.length > 1

  // ── Cadre exterieur ──
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1.4)
  doc.rect(M, M, pageWidth - M * 2, pageHeight - M * 2)
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(0.5)
  doc.rect(M + 5, M + 5, pageWidth - (M + 5) * 2, pageHeight - (M + 5) * 2)

  let y = P + 10

  // ══════════════════════════════════════════
  // EN-TETE — organisateur, badge OFFICIEL, Comite d'Organisation
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(L.organisateurLabel, P, y)

  // Badge OFFICIEL — rectangle encadre bleu COPAF
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  const badgeTextW = doc.getTextWidth(L.officielBadge)
  const badgeW = badgeTextW + 20
  const badgeH = 15
  const badgeX = pageWidth - P - badgeW
  const badgeY = y - 11
  doc.setDrawColor(...BLUE)
  doc.setLineWidth(1)
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'S')
  doc.setTextColor(...BLUE)
  doc.text(L.officielBadge, badgeX + badgeW / 2, badgeY + 10.5, { align: 'center' })

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...NAVY)
  doc.text(L.comiteOrganisation, P, y)

  y += 8
  doc.setDrawColor(...GRAY)
  doc.setLineWidth(0.4)
  doc.line(P, y, pageWidth - P, y)
  y += 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...NAVY)
  doc.text(titreLong, P, y)
  y += 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...BLUE)
  doc.text(EVENT.nom, P, y)
  y += 11
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(`${dates}  —  ${lieu}`, P, y)
  y += 16

  // ══════════════════════════════════════════
  // SECTION 1 — ATTESTATION D'INSCRIPTION
  // ══════════════════════════════════════════
  doc.setFillColor(...NAVY)
  doc.rect(P, y, contentW, 20, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(255, 255, 255)
  doc.text(L.attestationBandeau, P + 10, y + 14)
  y += 20

  const attestationText = isGroup
    ? L.attestationGroupe(delegationName || form.organisation || '—', nb, titreLong, datesSentence, lieu)
    : L.attestationIndiv(form.prenom || '', form.nom || '', form.organisation || '', titreLong, datesSentence, lieu)

  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  const attestationWrapped = doc.setFont('helvetica', 'normal').setFontSize(9).splitTextToSize(attestationText, contentW - 24)
  const attestationBoxH = attestationWrapped.length * 12 + 26
  doc.rect(P, y, contentW, attestationBoxH, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.text(attestationWrapped, P + 12, y + 15)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text(`— ${L.attestationSignature}, COPAF 2026`, P + contentW - 12, y + attestationBoxH - 9, { align: 'right' })

  y += attestationBoxH + 14

  // ══════════════════════════════════════════
  // SECTION 2 — RECAPITULATIF D'INSCRIPTION
  // ══════════════════════════════════════════
  doc.setFillColor(...BLUE)
  doc.rect(P, y, contentW, 20, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(255, 255, 255)
  doc.text(L.recapBandeau, P + 10, y + 14)

  const statutLabel = paiementMode === 'maintenant' ? L.statutAttente : L.statutReserve
  const statutColor = paiementMode === 'maintenant' ? [217, 119, 6] : [37, 99, 235]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  const statutWidth = doc.getTextWidth(statutLabel) + 14
  doc.setFillColor(...statutColor)
  doc.roundedRect(P + contentW - statutWidth - 6, y + 3, statutWidth, 14, 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(statutLabel, P + contentW - statutWidth - 6 + statutWidth / 2, y + 12.5, { align: 'center' })
  y += 28

  if (isGroup) {
    doc.setFillColor(...LIGHT_BG)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.rect(P, y, contentW, 18, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(L.tableHeader.dossier, P + 8, y + 12)
    doc.text(L.tableHeader.participant, P + 110, y + 12)
    doc.text(L.tableHeader.fonction, P + 245, y + 12)
    doc.text(L.tableHeader.tarif, P + contentW - 8, y + 12, { align: 'right' })
    y += 18

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    participants.forEach((p, idx) => {
      const rowY = y + 12
      if (idx % 2 === 1) {
        doc.setFillColor(252, 254, 255)
        doc.rect(P, y, contentW, 16, 'F')
      }
      doc.setTextColor(...DARK)
      doc.text(p.dossier || dossier, P + 8, rowY)
      doc.setFont('helvetica', 'bold')
      doc.text(`${p.prenom} ${p.nom}`.toUpperCase(), P + 110, rowY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY)
      doc.text(p.fonction || '', P + 245, rowY)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DARK)
      doc.text(fmtEur(p.tarif || 3500), P + contentW - 8, rowY, { align: 'right' })

      doc.setDrawColor(235, 240, 245)
      doc.line(P, y + 16, P + contentW, y + 16)
      y += 16
    })

    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NAVY)
    doc.text(`${L.recapLabels.montant} (${nb}) :`, P + 8, y + 10)
    doc.text(fmtEur(total), P + contentW - 8, y + 10, { align: 'right' })
    y += 20
  } else {
    const montantLabel = L.montantSuffix(fmtEur(total))
    const recap = [
      [L.recapLabels.ref, `N° ${dossier}`],
      [L.recapLabels.evenement, `${EVENT.nom} — ${titreLong}`],
      [L.recapLabels.participants, String(nb)],
      [L.recapLabels.montant, montantLabel],
    ]

    let totalTableH = 0
    const preparedRecap = recap.map(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      const lines = doc.splitTextToSize(String(value), contentW * 0.58)
      const rowH = Math.max(16, lines.length * 10 + 6)
      totalTableH += rowH
      return { label, lines, rowH }
    })

    doc.setFillColor(...LIGHT_BG)
    doc.rect(P, y, contentW, totalTableH, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(P, y, contentW, totalTableH)

    let currentY = y + 10
    preparedRecap.forEach((row, i) => {
      if (i > 0) doc.line(P, currentY - 8, P + contentW, currentY - 8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...GRAY)
      doc.text(row.label, P + 10, currentY)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...DARK)
      doc.text(row.lines, P + contentW - 10, currentY, { align: 'right' })
      currentY += row.rowH
    })
    y += totalTableH + 14
  }

  // ── Coordonnees bancaires ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(L.coordBancairesTitre, P, y)
  y += 9

  doc.setFillColor(...BLUE_BG)
  doc.setDrawColor(191, 219, 254)
  doc.setLineWidth(0.6)
  doc.rect(P, y - 6, contentW, 44, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...DARK)
  doc.text(`${L.banque} : ${RIB.banque}`, P + 10, y + 5)
  doc.text(`${L.titulaire} : ${RIB.titulaire}`, P + contentW / 2 + 10, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text(`${L.ibanLabel} : ${RIB.iban}`, P + 10, y + 17)
  doc.text(`${L.bic} : ${RIB.bic}`, P + contentW / 2 + 10, y + 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...RED)
  doc.text(L.alertRib1, P + 10, y + 30)
  const textWidthPre = doc.getTextWidth(L.alertRib1)
  doc.setTextColor(...BLUE)
  doc.setFont('helvetica', 'bold')
  doc.text(L.alertRibLink, P + 10 + textWidthPre, y + 30)
  doc.link(P + 10 + textWidthPre, y + 23, doc.getTextWidth(L.alertRibLink), 10, { url: verificationUrl })

  y += 48

  // ── Prochaines etapes ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text(L.prochainesEtapesTitre, P, y)
  y += 11

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK)
  L.etapes.forEach((line, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${line}`, contentW - 4)
    doc.text(lines, P, y)
    y += lines.length * 9.5 + 2
  })
  y += 6

  // ── Contact & WhatsApp ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  const contactLines = doc.splitTextToSize(L.contactText, contentW)
  doc.text(contactLines, P, y)
  y += contactLines.length * 9.5 + 8

  const btnW = 150
  const btnH = 19
  doc.setFillColor(...GREEN_WA)
  doc.roundedRect(P, y, btnW, btnH, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(L.waBouton, P + btnW / 2, y + 12.5, { align: 'center' })
  doc.link(P, y, btnW, btnH, { url: whatsappUrl })

  y += btnH + 14

  // ── Date, QR code, signature ──
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...DARK)
  doc.text(L.faitA(fmtDateLong(now, lang)), P, y)

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
  const qrSize = 42
  const qrX = P + 120

  if (qrBase64) {
    doc.addImage(qrBase64, 'PNG', qrX, y - 8, qrSize, qrSize)
    doc.link(qrX, y - 8, qrSize, qrSize, { url: verificationUrl })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(...GRAY)
    doc.text(L.qrHint, qrX + qrSize / 2, y - 8 + qrSize + 8, { align: 'center' })
  }

  const sigX = P + contentW - 110
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text(L.cordialement, sigX, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(L.equipe(CONTACT.structure), sigX, y + 11)
  doc.text(CONTACT.site, sigX, y + 21)

  // ── Pied de page ──
  const fy = pageHeight - M - 46
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(P, fy, pageWidth - P, fy)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  doc.text(L.footer1, P, fy + 10)
  doc.text(L.footer2(fmtDateLong(now, lang)), P, fy + 20)
  doc.text(`${EVENT.organisateur} · ${CONTACT.email}`, pageWidth - P, fy + 10, { align: 'right' })
  doc.text(`${CONTACT.tel1} · ${CONTACT.tel2}`, pageWidth - P, fy + 20, { align: 'right' })

  if (download) {
    doc.save(`COPAF2026-Attestation-${dossier}.pdf`)
    return null
  }
  return doc
}