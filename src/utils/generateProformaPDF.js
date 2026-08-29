// src/utils/generateProformaPDF.js
//
// Genere la FACTURE PROFORMA officielle CRF Perfection / COPAF 2026.
//
// Modes :
//  - INDIVIDUEL (par defaut) : une ligne "Frais de participation" avec
//    quantite / prix unitaire / total.
//  - GROUPE (si `participants` contient plus d'1 entree) : facture adressee
//    a l'organisation / la delegation, detail ligne par ligne (dossier, nom
//    & prenom, poste, montant), pagination automatique si necessaire.
//
// Normes facture pro ajoutees (aout 2026) :
//  - Montant total en toutes lettres (protection anti-falsification)
//  - Ligne "OBJET" isolee et lisible
//  - Conditions de reglement explicites (virement, frais a la charge du
//    donneur d'ordre)
//  - QR code pointant vers la page de verification des coordonnees
//    bancaires (copaf-ports.com/verifier)

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

const MAROON    = [150, 24, 42]
const GOLD      = [173, 141, 63]
const GRAY      = [107, 114, 128]
const DARK      = [17, 24, 39]
const LIGHT_BG  = [249, 250, 251]
const LINE      = [229, 231, 235]
const GREEN_BG  = [240, 253, 244]
const GREEN_TXT = [22, 163, 74]
const BLUE_BG   = [239, 246, 255]
const GOLD_BG   = [250, 246, 234]
const WHITE     = [255, 255, 255]

const EMETTEUR = {
  nom: 'CRF PERFECTION',
  adresse: 'Cotonou, Bénin',
  email: 'contact@copaf-ports.com',
  emailAlt: 'contactcrfperfection@gmail.com',
  tel1: '+229 0169 30 30 19',
  tel2: '+1 (240) 978-4155',
  ifu: '87015034851',
  rccm: 'RCCM RB COT/15-B-13727',
}

const RIB = {
  banque: 'Société Générale Bénin (SGB)',
  iban: 'BJ66 BJ10 4001 0003 7628 1201 0162',
  bic: 'SOGEBJBJ',
  titulaire: 'CRF PERFECTION',
}

const VERIF_URL = 'https://copaf-ports.com/verifier'

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
    bandeau: 'FACTURE PROFORMA',
    emetteur: 'ÉMETTEUR',
    destinataire: 'DESTINATAIRE',
    numProforma: 'N° DE PROFORMA',
    dateEmission: "DATE D'ÉMISSION",
    validite: 'VALIDITÉ',
    validite30: '30 jours',
    objetLabel: 'OBJET',
    objetTexte: 'Frais de participation à la COPAF 2026',
    objetTexteGroupe: 'Frais de participation à la COPAF 2026 (délégation)',
    detailPrestation: 'Détail de la prestation',
    colDescription: 'DESCRIPTION',
    colQte: 'QTÉ',
    colPu: 'P.U.',
    colTotal: 'TOTAL',
    ligneDesc: 'Frais de participation — COPAF 2026',
    ligneSousDesc: 'Voir prestations incluses ci-dessous',
    montantTotalTtc: 'MONTANT TOTAL TTC',
    montantLettresPrefix: 'Montant total arrêté à la présente facture proforma à la somme de :',
    prestationsIncluses: 'Prestations incluses dans ce montant',
    coordBancaires: 'Coordonnées bancaires pour règlement',
    banque: 'Banque', iban: 'IBAN', bic: 'BIC', titulaire: 'Titulaire',
    ribNote: 'NB : Virement RTGS préféré',
    reglementNote: "Règlement par virement bancaire aux coordonnées ci-dessus. Frais de virement à la charge du donneur d'ordre.",
    qrCaption: 'Scannez pour vérifier nos coordonnées bancaires officielles',
    mention: "Ce document est une facture proforma établie à titre indicatif pour faciliter l'autorisation interne du virement par les services financiers du client. Elle ne constitue pas une facture définitive au sens comptable et ne peut être utilisée comme justificatif de paiement. Une facture définitive sera émise après réception effective du règlement.",
    ifuLabel: 'IFU',
    dateLocale: 'fr-FR',
    numLocale: 'de-DE',
    // ── Mode groupe ──
    delegationLabel: n => `Délégation de ${n} participants`,
    colParticipant: 'PARTICIPANT',
    colPoste: 'POSTE',
    colDossier: 'DOSSIER',
    colMontant: 'MONTANT',
    suite: '(suite)',
  },
  en: {
    tagline: 'Research and Training Firm',
    bandeau: 'PROFORMA INVOICE',
    emetteur: 'ISSUER',
    destinataire: 'RECIPIENT',
    numProforma: 'PROFORMA NO.',
    dateEmission: 'ISSUE DATE',
    validite: 'VALIDITY',
    validite30: '30 days',
    objetLabel: 'SUBJECT',
    objetTexte: 'Participation fee for COPAF 2026',
    objetTexteGroupe: 'Participation fee for COPAF 2026 (delegation)',
    detailPrestation: 'Service details',
    colDescription: 'DESCRIPTION',
    colQte: 'QTY',
    colPu: 'UNIT PRICE',
    colTotal: 'TOTAL',
    ligneDesc: 'Participation fee — COPAF 2026',
    ligneSousDesc: 'See included services below',
    montantTotalTtc: 'TOTAL AMOUNT',
    montantLettresPrefix: 'Total amount of this proforma invoice set at the sum of:',
    prestationsIncluses: 'Services included in this amount',
    coordBancaires: 'Bank details for payment',
    banque: 'Bank', iban: 'IBAN', bic: 'BIC', titulaire: 'Account holder',
    ribNote: 'NB: RTGS transfer preferred',
    reglementNote: "Payment by bank transfer to the details above. Transfer fees are the responsibility of the remitter.",
    qrCaption: 'Scan to verify our official bank details',
    mention: "This document is a proforma invoice issued for informational purposes to facilitate internal authorisation of the transfer by the client's financial department. It does not constitute a final invoice for accounting purposes and cannot be used as proof of payment. A final invoice will be issued upon actual receipt of payment.",
    ifuLabel: 'Tax ID',
    dateLocale: 'en-GB',
    numLocale: 'en-US',
    // ── Group mode ──
    delegationLabel: n => `Delegation of ${n} participants`,
    colParticipant: 'PARTICIPANT',
    colPoste: 'POSITION',
    colDossier: 'FILE NO.',
    colMontant: 'AMOUNT',
    suite: '(cont.)',
  },
}

function fmtEur(n) {
  const num = Number(n) || 0
  return `${Number.isInteger(num) ? num : num.toFixed(2)} EUR`
}

function fmtDateLong(d = new Date(), lang = 'fr') {
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

// ══════════════════════════════════════════
// NOMBRE EN LETTRES (protection anti-falsification du montant)
// ══════════════════════════════════════════
function numberToWordsFR(n) {
  if (n === 0) return 'zéro'
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', '', 'quatre-vingt', '']

  function twoDigits(num) {
    if (num < 20) return units[num]
    const t = Math.floor(num / 10)
    const u = num % 10
    if (t === 7 || t === 9) {
      if (u === 0) return t === 7 ? 'soixante-dix' : 'quatre-vingt-dix'
      if (u === 1 && t === 7) return 'soixante et onze'
      return `${t === 7 ? 'soixante' : 'quatre-vingt'}-${units[10 + u]}`
    }
    if (u === 0) return t === 8 ? 'quatre-vingts' : tens[t]
    if (u === 1 && t !== 8) return `${tens[t]} et un`
    return `${tens[t]}-${units[u]}`
  }

  function threeDigits(num) {
    const h = Math.floor(num / 100)
    const rest = num % 100
    let str = ''
    if (h > 0) {
      str += h === 1 ? 'cent' : `${units[h]} cent`
      if (h > 1 && rest === 0) str += 's'
    }
    if (rest > 0) str += (str ? ' ' : '') + twoDigits(rest)
    return str
  }

  const millions = Math.floor(n / 1e6)
  const thousands = Math.floor((n % 1e6) / 1e3)
  const remainder = n % 1000

  const parts = []
  if (millions > 0) parts.push(`${millions === 1 ? 'un' : threeDigits(millions)} million${millions > 1 ? 's' : ''}`)
  if (thousands > 0) parts.push(`${thousands === 1 ? '' : threeDigits(thousands) + ' '}mille`)
  if (remainder > 0 || parts.length === 0) parts.push(threeDigits(remainder))

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function numberToWordsEN(n) {
  if (n === 0) return 'zero'
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

  function twoDigits(num) {
    if (num < 20) return ones[num]
    const t = Math.floor(num / 10)
    const u = num % 10
    return u === 0 ? tens[t] : `${tens[t]}-${ones[u]}`
  }
  function threeDigits(num) {
    const h = Math.floor(num / 100)
    const rest = num % 100
    let str = ''
    if (h > 0) str += `${ones[h]} hundred`
    if (rest > 0) str += (str ? ' and ' : '') + twoDigits(rest)
    return str
  }

  const millions = Math.floor(n / 1e6)
  const thousands = Math.floor((n % 1e6) / 1e3)
  const remainder = n % 1000

  const parts = []
  if (millions > 0) parts.push(`${threeDigits(millions)} million`)
  if (thousands > 0) parts.push(`${threeDigits(thousands)} thousand`)
  if (remainder > 0 || parts.length === 0) parts.push(threeDigits(remainder))

  return parts.join(' ').trim()
}

function amountInWords(n, lang) {
  const num = Math.round((Number(n) || 0) * 100) / 100
  const intPart = Math.floor(num)
  const cents = Math.round((num - intPart) * 100)
  const words = lang === 'en' ? numberToWordsEN(intPart) : numberToWordsFR(intPart)
  let str = lang === 'en' ? `${words} euros` : `${words} euros`
  if (cents > 0) {
    const centsWords = lang === 'en' ? numberToWordsEN(cents) : numberToWordsFR(cents)
    str += lang === 'en' ? ` and ${centsWords} cents` : ` et ${centsWords} centimes`
  }
  return capitalize(str)
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

export async function generateProformaPDF({
  form, dossier, nb, total, lang = 'fr', download = true, logoSrc = '/crflogo.png',
  participants = [], delegationName = '',
}) {
  const L = TXT[lang] || TXT.fr
  const PRESTATIONS_INCLUSES = PRESTATIONS[lang] || PRESTATIONS.fr
  const isGroupe = Array.isArray(participants) && participants.length > 1
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 46
  const contentW = W - M * 2
  let y = 0

  const numero = `PF-${dossier}`
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

  const drawFooter = () => {
    const footerY = H - 48
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, footerY, W - M, footerY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text('CRF Perfection — contact@copaf-ports.com', M, footerY + 14)
    doc.text(EMETTEUR.emailAlt, M, footerY + 26)
    doc.text(`${EMETTEUR.tel1}  ·  ${EMETTEUR.tel2}`, W - M, footerY + 14, { align: 'right' })
  }

  // ══════════════════════════════════════════
  // EN-TETE
  // ══════════════════════════════════════════
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
    const crfW = doc.getTextWidth('CRF ')
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
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text(L.bandeau, W - M - bannerW / 2, 20 + bannerH / 2 + 5, { align: 'center' })

  y = Math.max(84, 14 + logoH + 22)
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
  doc.text(L.emetteur, M, y)
  doc.text(L.destinataire, colX2, y)
  y += 13

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...DARK)
  doc.text(EMETTEUR.nom, M, y)
  const destNom = isGroupe ? (delegationName || form.organisation || '—') : (form.organisation || '—')
  const destText = doc.splitTextToSize(destNom, colW)
  doc.text(destText, colX2, y)
  y += 13

  const emetteurLines = [
    EMETTEUR.adresse,
    EMETTEUR.email,
    EMETTEUR.emailAlt,
    `${EMETTEUR.tel1}`,
    EMETTEUR.tel2,
    `${L.ifuLabel} : ${EMETTEUR.ifu || '—'}`,
    EMETTEUR.rccm,
  ]
  const destLines = isGroupe
    ? [form.pays || '—', L.delegationLabel(participants.length)]
    : [
        `${form.prenom || ''} ${form.nom || ''}`.trim(),
        form.poste || '—',
        form.pays || '—',
        form.email || '—',
      ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  let ey = y
  emetteurLines.forEach(line => { doc.text(line, M, ey); ey += 10.5 })

  let dy = y + (destText.length - 1) * 11.5
  destLines.forEach(line => { doc.text(line, colX2, dy); dy += 11.5 })

  y = Math.max(ey, dy) + 10

  // ══════════════════════════════════════════
  // BANDEAU INFOS (numero / date / validite)
  // ══════════════════════════════════════════
  const infoH = 42
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(M, y, contentW, infoH, 5, 5, 'F')
  const infoColW = contentW / 3
  const infos = [
    [L.numProforma, numero],
    [L.dateEmission, fmtDateLong(new Date(), lang)],
    [L.validite, L.validite30],
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
  y += infoH + 8

  // ══════════════════════════════════════════
  // OBJET — ligne isolee et lisible
  // ══════════════════════════════════════════
  const objetH = 24
  doc.setFillColor(...GOLD_BG)
  doc.roundedRect(M, y, contentW, objetH, 5, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...GOLD)
  doc.text(L.objetLabel, M + 14, y + 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...MAROON)
  doc.text(isGroupe ? L.objetTexteGroupe : L.objetTexte, M + 14, y + 20)
  y += objetH + 10

  // ══════════════════════════════════════════
  // DETAIL DE LA PRESTATION
  // ══════════════════════════════════════════
  sectionLabel(L.detailPrestation, y)
  y += 12

  if (!isGroupe) {
    // ── Mode individuel ──
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
    y += rowH + 8
  } else {
    // ── Mode groupe : une ligne par participant ──
    const colDossier = contentW * 0.18
    const colNom     = contentW * 0.34
    const headerH = 22
    const rowH = 20

    const drawTableHeader = (yy, suffix = '') => {
      doc.setFillColor(...MAROON)
      doc.rect(M, yy, contentW, headerH, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...WHITE)
      doc.text(L.colDossier + suffix, M + 10, yy + 14.5)
      doc.text(L.colParticipant, M + colDossier + 10, yy + 14.5)
      doc.text(L.colPoste, M + colDossier + colNom + 10, yy + 14.5)
      doc.text(L.colMontant, M + contentW - 10, yy + 14.5, { align: 'right' })
      return yy + headerH
    }

    y = drawTableHeader(y)

    participants.forEach((p, i) => {
      if (y + rowH > FOOTER_TOP - 40) {
        drawFooter()
        doc.addPage()
        y = 50
        y = drawTableHeader(y, ` ${L.suite}`)
      }

      const bg = i % 2 === 0 ? WHITE : LIGHT_BG
      doc.setFillColor(...bg)
      doc.rect(M, y, contentW, rowH, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...GRAY)
      doc.text(String(p.dossier || dossier || '—'), M + 10, y + 13.5)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      const nomComplet = `${p.prenom || ''} ${p.nom || ''}`.trim() || '—'
      doc.text(nomComplet, M + colDossier + 10, y + 13.5)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...GRAY)
      doc.text(p.fonction || p.poste || '—', M + colDossier + colNom + 10, y + 13.5)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      doc.text(fmtEur(p.tarif ?? p.montant ?? 0), M + contentW - 10, y + 13.5, { align: 'right' })

      y += rowH
    })

    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.rect(M, y - participants.length * rowH, contentW, participants.length * rowH)
    y += 12
  }

  // ══════════════════════════════════════════
  // TOTAL
  // ══════════════════════════════════════════
  if (y + 34 + 40 + 14 + 90 > FOOTER_TOP) {
    drawFooter()
    doc.addPage()
    y = 50
  }

  const totalW = 230
  const totalH = 34
  doc.setFillColor(...MAROON)
  doc.roundedRect(W - M - totalW, y, totalW, totalH, 5, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(220, 200, 150)
  doc.text(L.montantTotalTtc, W - M - totalW + 14, y + 15)
  doc.setFontSize(14)
  doc.setTextColor(...WHITE)
  doc.text(fmtEur(total), W - M - 14, y + 27, { align: 'right' })
  y += totalH + 10

  // ══════════════════════════════════════════
  // MONTANT EN TOUTES LETTRES — protection anti-falsification
  // ══════════════════════════════════════════
  const lettresText = `${L.montantLettresPrefix} ${amountInWords(total, lang)} (${fmtEur(total)}).`
  const lettresWrapped = doc.setFont('helvetica', 'italic').setFontSize(7.5).splitTextToSize(lettresText, contentW - 20)
  const lettresH = lettresWrapped.length * 9.5 + 12
  doc.setFillColor(...LIGHT_BG)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.75)
  doc.roundedRect(M, y, contentW, lettresH, 5, 5, 'S')
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK)
  doc.text(lettresWrapped, M + 10, y + 12)
  y += lettresH + 10

  // ══════════════════════════════════════════
  // PRESTATIONS INCLUSES
  // ══════════════════════════════════════════
  sectionLabel(L.prestationsIncluses, y)
  y += 12

  const boxPad = 8
  const lineH = 13
  const halfLen = Math.ceil(PRESTATIONS_INCLUSES.length / 2)
  const colLeft = PRESTATIONS_INCLUSES.slice(0, halfLen)
  const colRight = PRESTATIONS_INCLUSES.slice(halfLen)
  const boxH = Math.max(colLeft.length, colRight.length) * lineH + boxPad * 2
  if (y + boxH > FOOTER_TOP - 10) {
    drawFooter()
    doc.addPage()
    y = 50
    sectionLabel(L.prestationsIncluses, y)
    y += 12
  }
  doc.setFillColor(...GREEN_BG)
  doc.roundedRect(M, y, contentW, boxH, 5, 5, 'F')
  const prestaColW = contentW / 2
  const drawPrestaCol = (items, colX) => {
    let py = y + boxPad + 8
    items.forEach(item => {
      doc.setFillColor(...GREEN_TXT)
      doc.circle(colX + 16, py - 3, 1.8, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...DARK)
      doc.text(item, colX + 26, py, { maxWidth: prestaColW - 34 })
      py += lineH
    })
  }
  drawPrestaCol(colLeft, M)
  drawPrestaCol(colRight, M + prestaColW)
  y += boxH + 10

  // ══════════════════════════════════════════
  // RIB + QR CODE DE VERIFICATION + CONDITIONS DE REGLEMENT
  // ══════════════════════════════════════════
  sectionLabel(L.coordBancaires, y)
  y += 10

  const qrSize = 60
  const qrGap = 14
  const ribBoxW = contentW - qrSize - qrGap
  const ribRows = [[L.banque, RIB.banque], [L.iban, RIB.iban], [L.bic, RIB.bic], [L.titulaire, RIB.titulaire]]
  const ribLineH = 13.5
  const ribNoteH = 14
  const ribH = ribRows.length * ribLineH + 8 + ribNoteH

  if (y + Math.max(ribH, qrSize + 20) > FOOTER_TOP - 10) {
    drawFooter()
    doc.addPage()
    y = 50
    sectionLabel(L.coordBancaires, y)
    y += 10
  }

  doc.setFillColor(...BLUE_BG)
  doc.roundedRect(M, y, ribBoxW, ribH, 5, 5, 'F')
  let ry = y + 16
  ribRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(label, M + 16, ry)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...MAROON)
    doc.text(value, M + ribBoxW - 16, ry, { align: 'right' })
    ry += ribLineH
  })
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text(L.ribNote, M + 16, ry + 3)

  // QR code -> page de verification des coordonnees bancaires officielles
  try {
    const qrDataUrl = await QRCode.toDataURL(VERIF_URL, { margin: 0, width: 256, color: { dark: '#0f172a', light: '#ffffff' } })
    const qrX = M + ribBoxW + qrGap
    doc.setFillColor(...WHITE)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.roundedRect(qrX, y, qrSize, qrSize, 4, 4, 'S')
    doc.addImage(qrDataUrl, 'PNG', qrX + 4, y + 4, qrSize - 8, qrSize - 8)
  } catch {
    // Si la generation du QR echoue (lib absente, etc.), on continue sans —
    // le RIB texte reste lisible, ce n'est pas bloquant.
  }

  const ribBottom = Math.max(ribH, qrSize)
  y += ribBottom + 4

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  const qrCaptionWrapped = doc.splitTextToSize(L.qrCaption, qrSize + 18)
  doc.text(qrCaptionWrapped, M + ribBoxW + qrGap + (qrSize + 18) / 2, y, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...DARK)
  const reglementWrapped = doc.splitTextToSize(L.reglementNote, ribBoxW - 4)
  doc.text(reglementWrapped, M, y)
  y += Math.max(reglementWrapped.length * 9, qrCaptionWrapped.length * 8) + 8

  // ══════════════════════════════════════════
  // MENTION LEGALE
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  const mention = doc.splitTextToSize(L.mention, contentW)
  if (y + mention.length * 8 > FOOTER_TOP - 10) {
    drawFooter()
    doc.addPage()
    y = 50
  }
  doc.text(mention, M, y)

  // ══════════════════════════════════════════
  // PIED DE PAGE
  // ══════════════════════════════════════════
  drawFooter()

  if (download) {
    doc.save(`FACTURE_${numero}.pdf`)
    return null
  }
  return doc
}