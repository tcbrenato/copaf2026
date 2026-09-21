// src/utils/generateAttestationPDF.js
//
// Attestation de participation COPAF 2026 (FR / EN), generee dans le navigateur (jsPDF) au nom du
// participant connecte. Meme charte que le guide : bleu marine #00367F, bleu ciel #1798F4, Poppins.
// Elle n'est proposee dans l'espace participant qu'a partir de la fin du Jour 2 (voir attestationDisponible).

import jsPDF from 'jspdf'

const NAVY = [0, 54, 127]
const SKY = [23, 152, 244]
const INK = [10, 31, 61]
const TEXT = [51, 65, 85]
const MUTED = [100, 116, 139]
const CARD = [244, 248, 252]

const PAGE = { w: 210, h: 297 }
const M = 24
const CW = PAGE.w - 2 * M

// Fin du Jour 2 (20 octobre 2026, 18h00 a Casablanca, UTC+1)
export const ATTESTATION_DISPONIBLE_LE = new Date('2026-10-20T18:00:00+01:00')
export const attestationDisponible = (maintenant = new Date()) => maintenant >= ATTESTATION_DISPONIBLE_LE

const TXT = {
  fr: {
    fichier: 'Attestation_de_participation_COPAF2026',
    conf: 'Conférence des Ports Africains',
    titre: 'ATTESTATION DE PARTICIPATION',
    atteste: 'Le Dr William ODAH, Directeur Général de CRF Perfection, atteste que',
    a: "a participé à la Conférence des Ports Africains (COPAF 2026), qui s'est tenue du 19 au 21 octobre 2026 au Port de Casablanca (Maroc), sur le thème :",
    theme: '« Smart Port Africain : Intelligence Artificielle et Cybersécurité au service de la performance »',
    valeur: 'Cette attestation est délivrée pour servir et valoir ce que de droit.',
    lignes: [['Événement', 'COPAF 2026 · Conférence des Ports Africains'], ['Dates', '19, 20 et 21 octobre 2026'], ['Lieu', 'Port de Casablanca, Maroc']],
    delivree: d => `Délivrée le ${d}`,
    ref: dossier => `Réf : ${dossier}`,
    roleSignataire: 'Directeur Général, CRF Perfection',
    date: d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
    partenaires: ['Coordination technique', 'Haute Autorité de Tutelle', 'Partenaire Hôte', 'Partenaire'],
  },
  en: {
    fichier: 'Certificate_of_participation_COPAF2026',
    conf: 'African Ports Conference',
    titre: 'CERTIFICATE OF PARTICIPATION',
    atteste: 'Dr William ODAH, Director General of CRF Perfection, hereby certifies that',
    a: 'took part in the African Ports Conference (COPAF 2026), held from 19 to 21 October 2026 at the Port of Casablanca (Morocco), on the theme:',
    theme: '“Smart African Port: Artificial Intelligence and Cybersecurity for Performance”',
    valeur: 'This certificate is issued for whatever purpose it may serve.',
    lignes: [['Event', 'COPAF 2026 · African Ports Conference'], ['Dates', '19, 20 and 21 October 2026'], ['Venue', 'Port of Casablanca, Morocco']],
    delivree: d => `Issued on ${d}`,
    ref: dossier => `Ref: ${dossier}`,
    roleSignataire: 'Director General, CRF Perfection',
    date: d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
    partenaires: ['Technical Coordination', 'High Supervisory Authority', 'Host Partner', 'Partner'],
  },
}

async function chargerBinaire(src) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`Chargement impossible : ${src}`)
  return res.arrayBuffer()
}

function versBase64(buf) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

async function embarquerPoppins(doc) {
  try {
    const [reg, bold] = await Promise.all([chargerBinaire('/fonts/Poppins-Regular.ttf'), chargerBinaire('/fonts/Poppins-Bold.ttf')])
    doc.addFileToVFS('Poppins-Regular.ttf', versBase64(reg))
    doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal')
    doc.addFileToVFS('Poppins-Bold.ttf', versBase64(bold))
    doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold')
    return 'Poppins'
  } catch {
    return 'helvetica'
  }
}

function logo(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0)
      resolve({ data: c.toDataURL('image/jpeg', 0.92), ratio: img.naturalWidth / img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * @param {object} p
 * @param {{prenom?: string, nom?: string, organisation?: string, poste?: string, dossier: string}} p.personne
 * @param {'fr'|'en'} p.lang
 * @param {boolean} [p.download=false]
 * @param {Date} [p.date] - date de delivrance (aujourd'hui par defaut)
 * @returns {Promise<{ doc: jsPDF, filename: string }>}
 */
export async function generateAttestationPDF({ personne, lang = 'fr', download = false, date = new Date() }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const font = await embarquerPoppins(doc)
  const logos = await Promise.all([logo('/logocrf.png'), logo('/logoagpaoc.png'), logo('/ANP.png'), logo('/uapna.png')])
  const set = (style, size, color) => { doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...color) }

  // Bandeau marine
  doc.setFillColor(...NAVY); doc.rect(0, 0, PAGE.w, 74, 'F')
  try {
    doc.setGState(new doc.GState({ opacity: 0.10 }))
    doc.setFillColor(...SKY); doc.circle(190, 6, 42, 'F')
    doc.setGState(new doc.GState({ opacity: 0.06 }))
    doc.setFillColor(255, 255, 255); doc.circle(150, 62, 26, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))
  } catch { /* GState indisponible : bandeau uni */ }
  set('bold', 9, SKY); doc.text('COPAF 2026', M, 22, { charSpace: 0.6 })
  set('normal', 9, [200, 220, 245]); doc.text(L.conf.toUpperCase(), M, 28, { charSpace: 0.4 })
  set('bold', 23, [255, 255, 255])
  doc.splitTextToSize(L.titre, CW).forEach((t, i) => doc.text(t, M, 48 + i * 10))
  doc.setFillColor(...SKY); doc.rect(M, 61, 22, 1.4, 'F')

  // Corps
  let y = 92
  set('normal', 11, TEXT)
  doc.splitTextToSize(L.atteste, CW).forEach(t => { doc.text(t, M, y); y += 6.4 })
  y += 5

  const nom = [personne.prenom, personne.nom].filter(Boolean).join(' ').trim().toUpperCase()
  set('bold', 22, NAVY)
  const lignesNom = doc.splitTextToSize(nom, CW)
  lignesNom.forEach(t => { doc.text(t, M, y); y += 10 })
  const fonction = [personne.poste, personne.organisation].filter(Boolean).join(' — ')
  if (fonction) {
    set('normal', 11.5, MUTED)
    doc.splitTextToSize(fonction, CW).forEach(t => { doc.text(t, M, y); y += 6 })
  }
  doc.setFillColor(...SKY); doc.rect(M, y + 1.5, 14, 0.9, 'F')
  y += 11

  set('normal', 11, TEXT)
  doc.splitTextToSize(L.a, CW).forEach(t => { doc.text(t, M, y); y += 6.4 })
  y += 2
  set('bold', 11.5, NAVY)
  doc.splitTextToSize(L.theme, CW - 6).forEach(t => { doc.text(t, M + 3, y); y += 6.6 })
  y += 5

  // Carte evenement
  const hCarte = 8 + L.lignes.length * 8
  doc.setFillColor(...CARD); doc.rect(M, y, CW, hCarte, 'F')
  doc.setFillColor(...SKY); doc.rect(M, y, 1.2, hCarte, 'F')
  L.lignes.forEach(([k, v], i) => {
    const yy = y + 9.5 + i * 8
    set('bold', 7.5, SKY); doc.text(k.toUpperCase(), M + 7, yy, { charSpace: 0.5 })
    set('bold', 10, INK); doc.text(v, M + 42, yy)
  })
  y += hCarte + 12

  set('normal', 11, TEXT)
  doc.splitTextToSize(L.valeur, CW).forEach(t => { doc.text(t, M, y); y += 6.4 })

  // Signature (nom et fonction du signataire ; la signature manuscrite n'est pas apposee automatiquement)
  const ySig = 232
  set('normal', 9.5, MUTED); doc.text(L.delivree(L.date(date)), M, ySig)
  set('bold', 9.5, NAVY); doc.text(L.ref(personne.dossier), M, ySig + 6)
  const xSig = PAGE.w - M
  doc.setDrawColor(...MUTED); doc.setLineWidth(0.3); doc.line(xSig - 62, ySig + 4, xSig, ySig + 4)
  set('bold', 10.5, INK); doc.text('Dr William ODAH', xSig, ySig + 10, { align: 'right' })
  set('normal', 8.5, MUTED); doc.text(L.roleSignataire, xSig, ySig + 15, { align: 'right' })

  // Bande des partenaires
  doc.setDrawColor(212, 226, 244); doc.setLineWidth(0.3); doc.line(M, 254, PAGE.w - M, 254)
  const colW = CW / 4
  const H = 11
  logos.forEach((lg, i) => {
    const cx = M + colW * i + colW / 2
    if (lg) {
      const w = Math.min(colW - 8, H * lg.ratio)
      const h = w / lg.ratio
      doc.addImage(lg.data, 'JPEG', cx - w / 2, 260 + (H - h) / 2, w, h)
    }
    set('bold', 6.6, NAVY); doc.text(L.partenaires[i], cx, 278, { align: 'center' })
  })
  set('normal', 8, MUTED); doc.text('copaf-ports.com', PAGE.w / 2, 288, { align: 'center' })

  const suffixe = String(personne.dossier || '').replace(/[^A-Za-z0-9-]/g, '')
  const filename = `${L.fichier}${suffixe ? `_${suffixe}` : ''}.pdf`
  if (download) doc.save(filename)
  return { doc, filename }
}
