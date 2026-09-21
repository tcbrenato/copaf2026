// src/utils/generateVoyagePDF.js
//
// Guide du participant (identique pour tous) et Fiche de voyage individuelle,
// en francais ET en anglais, generes dans le navigateur (jsPDF) a partir des
// donnees saisies dans l'admin — aucun Word / LibreOffice requis.
//
// Design repris du kit fourni : bleu marine #00367F, bleu ciel #1798F4, cartes
// #F4F8FC, police Poppins, couverture a cercles.
//
// Les champs "a completer" du guide (adresse de la salle, contacts, horaires...)
// viennent de la table guide_config (saisie admin, FR + EN). Un champ vide est
// rendu en orange sous la forme [libelle] ; l'admin voit la liste des champs
// manquants et l'envoi est bloque tant qu'il en reste.

import jsPDF from 'jspdf'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { detecterCasesPage } from './pdfCases'

const NAVY = [0, 54, 127]       // #00367F
const SKY = [23, 152, 244]      // #1798F4
const CARD = [244, 248, 252]    // #F4F8FC
const TEXT = [30, 41, 59]
const MUTED = [100, 116, 139]
const WARN = [217, 119, 6]

const PAGE = { w: 210, h: 297 }
const M = 18
const CW = PAGE.w - 2 * M

// ─── Champs du guide (saisis par l'admin) ──────────────────────────────────
export const GUIDE_FIELDS = [
  { key: 'programme_url', fr: 'Lien du programme', en: 'Programme link', hint: 'https://copaf-ports.com/#programme', defaut: 'https://copaf-ports.com/#programme' },
  { key: 'salle_adresse', fr: 'Adresse de la salle', en: 'Venue address', hint: 'Port de Casablanca, Salle …' },
  { key: 'tablette_precision', fr: 'Tablette : précision', en: 'Tablet: details', hint: "Vous la conservez à l'issue de l'événement" },
  { key: 'contact_billet', fr: 'Contact pour envoyer le billet', en: 'Contact to send the ticket', hint: 'email / WhatsApp' },
  { key: 'date_limite_vols', fr: 'Date limite pour les infos de vol', en: 'Deadline for flight information', hint: '9 octobre 2026' },
  { key: 'badge_lieu_horaires', fr: 'Retrait du badge : lieu et horaires', en: 'Badge pick-up: place and times', hint: "Hall d'accueil, dès 8h00" },
  { key: 'jour3_rdv', fr: 'Jour 3 : rendez-vous (lieu et heure)', en: 'Day 3: meeting point (place and time)', hint: "Hall de l'hôtel, 8h30" },
  { key: 'attestation_mode', fr: 'Attestation : mode de remise', en: 'Certificate: how it is delivered', hint: 'et envoyée par email' },
  { key: 'climat', fr: 'Climat en octobre', en: 'Weather in October', hint: '18-25 °C' },
  { key: 'prises', fr: 'Prises électriques', en: 'Power sockets', hint: 'Type C / E' },
  { key: 'wifi', fr: 'Connexion Wi-Fi', en: 'Wi-Fi', hint: "Wi-Fi gratuit à l'hôtel" },
  { key: 'contact_comite', fr: "Contact : comité d'organisation", en: 'Contact: organising committee', hint: 'Nom · téléphone · email' },
  { key: 'contact_technique', fr: 'Contact : espace participant, badge, technique', en: 'Contact: participant area, badge, technical', hint: 'Rénato TCHOBO · email / WhatsApp' },
  { key: 'contact_logistique', fr: 'Contact : transferts et logistique à Casablanca', en: 'Contact: transfers and logistics in Casablanca', hint: 'Nom · téléphone local' },
  { key: 'contact_urgence', fr: 'Numéro d’urgence 24h/24', en: '24/7 emergency number', hint: '+212 …' },
  { key: 'navette', fr: 'Navette hôtel → port (fiches de voyage)', en: 'Hotel → port shuttle (travel sheets)', hint: "Départ de l'hôtel à 8h00, du 19 au 21 octobre · rendez-vous dans le hall" },
  { key: 'referent_nom', fr: 'Référent sur place (nom) — fiches de voyage', en: 'On-site contact (name) — travel sheets', hint: 'M. …' },
  { key: 'referent_tel', fr: 'Référent sur place (téléphone) — fiches de voyage', en: 'On-site contact (phone) — travel sheets', hint: '+212 …' },
]

// Champs communs aux fiches de voyage (pas necessaires a l'envoi du guide)
export const CHAMPS_COMMUNS_FICHE = ['navette', 'referent_nom', 'referent_tel']
const CLES_GUIDE = GUIDE_FIELDS.filter(f => !CHAMPS_COMMUNS_FICHE.includes(f.key)).map(f => f.key)

function valeurChamp(config, lang, key) {
  const def = GUIDE_FIELDS.find(f => f.key === key)?.defaut || ''
  const propre = config?.[lang]?.[key]
  const autre = config?.[lang === 'fr' ? 'en' : 'fr']?.[key]
  return String(propre || autre || def || '').replace(/(\*\*|__|<<|>>)/g, '').trim()
}

// Champs du guide encore vides pour la langue demandee (avec repli sur l'autre langue)
export function fichesChampsCommunsManquants(config, lang) {
  return CHAMPS_COMMUNS_FICHE.filter(k => !valeurChamp(config, lang, k))
}

export function guideChampsManquants(config, lang, cles = CLES_GUIDE) {
  return cles.filter(k => !valeurChamp(config, lang, k))
}

// ─── Utilitaires ───────────────────────────────────────────────────────────
const L1 = s => (s || '').replace(/\s+/g, ' ').trim()

async function chargerBinaire(src) {
  const res = await fetch(src)
  if (!res.ok) throw new Error(`Chargement impossible : ${src}`)
  return res.arrayBuffer()
}

function versBase64(buf) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
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

function chargerImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Image introuvable : ${src}`))
    img.src = src
  })
}

async function logo(src) {
  try {
    const img = await chargerImage(src)
    const c = document.createElement('canvas')
    c.width = img.naturalWidth; c.height = img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(img, 0, 0)
    return { data: c.toDataURL('image/jpeg', 0.9), ratio: img.naturalWidth / img.naturalHeight }
  } catch {
    return null
  }
}

export function pdfEnBase64(doc) {
  const dataUri = doc.output('datauristring')
  return dataUri.slice(dataUri.indexOf('base64,') + 7)
}

// ─── Moteur de mise en page ───────────────────────────────────────────────
function moteur(doc, font) {
  let y = 22
  const etat = { manquants: new Set() }

  const police = (style = 'normal', size = 10, color = TEXT) => {
    doc.setFont(font, style)
    doc.setFontSize(size)
    doc.setTextColor(...color)
  }
  const interligne = size => size * 0.3528 * 1.55
  const assurer = h => { if (y + h > PAGE.h - 24) { doc.addPage(); y = 22 } }

  const paragraphe = (texte, { size = 10, style = 'normal', color = TEXT, x = M, w = CW, apres = 3 } = {}) => {
    police(style, size, color)
    const lignes = doc.splitTextToSize(texte, w)
    const lh = interligne(size)
    lignes.forEach(l => { assurer(lh); doc.text(l, x, y + lh * 0.7); y += lh })
    y += apres
  }

  const titreSection = (etiquette, titre) => {
    assurer(26)
    police('bold', 8.5, SKY)
    doc.text(etiquette.toUpperCase(), M, y + 3)
    y += 7
    police('bold', 18, NAVY)
    const l = doc.splitTextToSize(titre, CW)
    l.forEach(t => { doc.text(t, M, y + 6); y += 8.5 })
    doc.setFillColor(...SKY); doc.rect(M, y + 1, 14, 0.9, 'F')
    y += 7
  }

  const sousTitre = (etiquette, titre) => {
    y += 3
    assurer(22)
    police('bold', 8, SKY)
    doc.text(etiquette.toUpperCase(), M, y + 3)
    y += 6
    police('bold', 12.5, NAVY)
    doc.text(titre, M, y + 4)
    y += 9
  }

  // Grille de cartes (2 colonnes par defaut)
  const cartes = (items, { colonnes = 2 } = {}) => {
    const gap = 5
    const w = (CW - gap * (colonnes - 1)) / colonnes
    for (let i = 0; i < items.length; i += colonnes) {
      const ligne = items.slice(i, i + colonnes)
      const mesures = ligne.map(it => {
        police('bold', 8, SKY)
        const lv = (() => { police('bold', 10, NAVY); return doc.splitTextToSize(it.valeur || '', w - 12) })()
        police('normal', 8.5, MUTED)
        const ld = it.detail ? doc.splitTextToSize(it.detail, w - 12) : []
        return { lv, ld, h: 7 + 5 + lv.length * 5 + ld.length * 4.4 + 6 }
      })
      const h = Math.max(...mesures.map(m => m.h))
      assurer(h + gap)
      ligne.forEach((it, j) => {
        const x = M + j * (w + gap)
        doc.setFillColor(...CARD); doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F')
        doc.setFillColor(...SKY); doc.rect(x, y + 4, 1.4, h - 8, 'F')
        police('bold', 7.5, SKY)
        doc.text(it.etiquette.toUpperCase(), x + 6, y + 6.5)
        let yy = y + 12
        police('bold', 10, NAVY)
        mesures[j].lv.forEach(t => { doc.text(t, x + 6, yy); yy += 5 })
        police('normal', 8.5, MUTED)
        mesures[j].ld.forEach(t => { doc.text(t, x + 6, yy); yy += 4.4 })
      })
      y += h + gap
    }
  }

  const puces = (items, { size = 10 } = {}) => {
    items.forEach(t => {
      police('normal', size, TEXT)
      const lignes = doc.splitTextToSize(t, CW - 8)
      const lh = interligne(size)
      assurer(lh * lignes.length + 1)
      doc.setFillColor(...SKY); doc.circle(M + 2, y + lh * 0.55, 0.9, 'F')
      lignes.forEach(l => { doc.text(l, M + 7, y + lh * 0.7); y += lh })
      y += 1
    })
    y += 2
  }

  // Bloc de note (fond bleu clair)
  const note = (texte, { couleur = SKY } = {}) => {
    police('normal', 9.5, TEXT)
    const lignes = doc.splitTextToSize(texte, CW - 12)
    const h = lignes.length * interligne(9.5) + 8
    assurer(h + 4)
    doc.setFillColor(...CARD); doc.roundedRect(M, y, CW, h, 2.5, 2.5, 'F')
    doc.setFillColor(...couleur); doc.rect(M, y + 3, 1.4, h - 6, 'F')
    police('normal', 9.5, TEXT)
    let yy = y + 5.5
    lignes.forEach(l => { doc.text(l, M + 6, yy); yy += interligne(9.5) })
    y += h + 4
  }

  // Valeur de champ : texte saisi ou [libelle] en orange (compte comme manquant)
  const champ = (config, lang, key) => {
    const v = valeurChamp(config, lang, key)
    if (v) return v
    etat.manquants.add(key)
    const lab = GUIDE_FIELDS.find(f => f.key === key)?.[lang] || key
    return `[${lab}]`
  }

  return {
    doc, etat, police, paragraphe, titreSection, sousTitre, cartes, puces, note, champ, assurer,
    get y() { return y }, set y(v) { y = v },
    saut: () => { doc.addPage(); y = 22 },
  }
}

function pieds(doc, gauche, font) {
  const n = doc.getNumberOfPages()
  for (let p = 2; p <= n; p++) {
    doc.setPage(p)
    doc.setDrawColor(226, 232, 240); doc.line(M, PAGE.h - 16, PAGE.w - M, PAGE.h - 16)
    doc.setFont(font, 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED)
    doc.text(gauche, M, PAGE.h - 10.5)
    doc.text(`${p - 1}`, PAGE.w - M, PAGE.h - 10.5, { align: 'right' })
  }
}

function pastilleManquante(doc, x, y, font) {
  doc.setFont(font, 'bold'); doc.setFontSize(8); doc.setTextColor(...WARN)
  doc.text('[ ] = champ à compléter', x, y)
}

// ─── Textes du guide ───────────────────────────────────────────────────────
const TXT = {
  fr: {
    fichier: 'Guide_du_Participant_COPAF2026',
    coverTitre: 'GUIDE DU PARTICIPANT',
    coverSous: 'Accueil, hébergement, déplacements\net informations pratiques',
    coverConf: 'Conférence des Ports Africains',
    coverTheme: 'Smart Port Africain : Intelligence Artificielle et Cybersécurité au service de la performance',
    coverDate: '19 – 21 octobre 2026  ·  Port de Casablanca, Maroc',
    partenaires: [['CRF Perfection', 'Coordination technique'], ['AGPAOC', 'Haute Autorité de Tutelle'], ['ANP', 'Partenaire Hôte']],
    pied: 'COPAF 2026  ·  Guide du participant  ·  copaf-ports.com',
  },
  en: {
    fichier: 'Participant_Guide_COPAF2026',
    coverTitre: 'PARTICIPANT GUIDE',
    coverSous: 'Welcome, accommodation, travel\nand practical information',
    coverConf: 'African Ports Conference',
    coverTheme: 'Smart African Port: Artificial Intelligence and Cybersecurity for Performance',
    coverDate: '19 – 21 October 2026  ·  Port of Casablanca, Morocco',
    partenaires: [['CRF Perfection', 'Technical coordination'], ['AGPAOC', 'Supervisory Authority'], ['ANP', 'Host Partner']],
    pied: 'COPAF 2026  ·  Participant guide  ·  copaf-ports.com',
  },
}

function contenuGuide(m, config, lang) {
  const f = key => m.champ(config, lang, key)
  const fr = lang === 'fr'

  // ── Bienvenue ──
  m.titreSection(fr ? 'Bienvenue' : 'Welcome', fr ? 'Introduction' : 'Introduction')
  m.paragraphe(fr ? 'Mesdames et Messieurs, chers participants,' : 'Ladies and gentlemen, dear participants,', { style: 'bold', color: NAVY })
  m.paragraphe(fr
    ? "C'est avec un grand plaisir que l'Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre (AGPAOC), le cabinet CRF Perfection et l'Agence Nationale des Ports du Royaume du Maroc vous accueillent à la Conférence des Ports Africains COPAF 2026, du 19 au 21 octobre 2026 au Port de Casablanca, sur le thème :"
    : "It is with great pleasure that the Association of Ports Management for West and Central Africa (AGPAOC), the firm CRF Perfection and the National Ports Agency of the Kingdom of Morocco welcome you to the African Ports Conference COPAF 2026, from 19 to 21 October 2026 at the Port of Casablanca, on the theme:")
  m.note(fr
    ? '« Smart Port Africain : Intelligence Artificielle et Cybersécurité au service de la performance »'
    : '“Smart African Port: Artificial Intelligence and Cybersecurity for Performance”')
  m.paragraphe(fr
    ? "Ce guide vous accompagne du moment où vous quittez votre pays jusqu'à votre retour : accueil, hébergement, déplacements, formalités et vie sur place. Ainsi, vous pourrez consacrer l'essentiel de votre attention aux échanges, aux rencontres et aux enseignements de ces trois journées."
    : 'This guide accompanies you from the moment you leave your country until your return: welcome, accommodation, travel, formalities and life on site. This way you can devote most of your attention to the exchanges, meetings and lessons of these three days.')
  m.paragraphe(fr ? "Nous vous souhaitons d'ores et déjà un excellent séjour." : 'We wish you an excellent stay.')
  m.paragraphe('Dr William ODAH', { style: 'bold', color: NAVY, apres: 0 })
  m.paragraphe(fr ? 'Directeur Général, CRF Perfection' : 'Director General, CRF Perfection', { size: 9, color: MUTED, apres: 8 })

  // ── En bref ──
  m.titreSection(fr ? 'La COPAF en bref' : 'COPAF at a glance', fr ? "L'essentiel en un coup d'œil" : 'The essentials at a glance')
  m.cartes([
    { etiquette: fr ? 'Dates de la conférence' : 'Conference dates', valeur: fr ? '19, 20 et 21 octobre 2026' : '19, 20 and 21 October 2026' },
    { etiquette: fr ? 'Lieu' : 'Venue', valeur: fr ? 'Port de Casablanca, Maroc' : 'Port of Casablanca, Morocco', detail: f('salle_adresse') },
    { etiquette: 'Format', valeur: fr ? '2 jours de conférence + 1 jour d\'immersion terrain' : '2 conference days + 1 field immersion day', detail: fr ? 'Visite technique du port' : 'Technical visit of the port' },
    { etiquette: fr ? 'Langues' : 'Languages', valeur: fr ? 'Français et anglais' : 'French and English', detail: fr ? 'Avec interprétation simultanée' : 'With simultaneous interpretation' },
    { etiquette: fr ? 'Séjour organisé' : 'Organised stay', valeur: fr ? 'Du 18 au 22 octobre 2026' : '18 to 22 October 2026', detail: fr ? '4 nuitées' : '4 nights' },
    { etiquette: fr ? 'Programme complet' : 'Full programme', valeur: fr ? 'Sessions, horaires et intervenants' : 'Sessions, times and speakers', detail: f('programme_url') },
  ])

  // ── Séjour ──
  m.titreSection(fr ? 'Votre séjour' : 'Your stay', fr ? 'Ce que prend en charge CRF Perfection' : 'What CRF Perfection covers')
  m.paragraphe(fr
    ? "Dans le cadre de votre participation, CRF Perfection assure l'organisation complète de votre séjour :"
    : 'As part of your participation, CRF Perfection organises your stay in full:')
  m.cartes([
    { etiquette: fr ? 'Accueil à l\'aéroport' : 'Airport welcome', valeur: fr ? 'Aéroport Mohammed V' : 'Mohammed V Airport', detail: fr ? 'À votre arrivée' : 'On your arrival' },
    { etiquette: 'Transferts', valeur: fr ? "De l'aéroport à l'hôtel, aller et retour" : 'Airport to hotel, both ways' },
    { etiquette: fr ? 'Hébergement' : 'Accommodation', valeur: fr ? 'Hôtel 4 étoiles · 4 nuitées' : '4-star hotel · 4 nights', detail: fr ? 'Du 18 au 22 octobre 2026' : '18 to 22 October 2026' },
    { etiquette: fr ? 'Navette quotidienne' : 'Daily shuttle', valeur: fr ? 'Entre l\'hôtel et le Port de Casablanca' : 'Between the hotel and the Port of Casablanca', detail: fr ? 'Chaque jour de la conférence' : 'Every day of the conference' },
    { etiquette: fr ? 'Repas' : 'Meals', valeur: fr ? 'Inclus dans votre participation' : 'Included in your participation' },
    { etiquette: fr ? 'Conférences et ateliers' : 'Conferences and workshops', valeur: fr ? "Accès à l'ensemble du programme" : 'Access to the whole programme' },
    { etiquette: fr ? 'Visite guidée' : 'Guided visit', valeur: fr ? 'Du Port de Casablanca (Jour 3)' : 'Of the Port of Casablanca (Day 3)' },
    { etiquette: fr ? 'Tablette' : 'Tablet', valeur: fr ? 'Remise sur place' : 'Handed out on site', detail: f('tablette_precision') },
    { etiquette: fr ? 'Attestation' : 'Certificate', valeur: fr ? 'Attestation de participation' : 'Certificate of participation' },
  ])
  m.note(fr
    ? "Vous n'avez aucune réservation d'hôtel ni de transfert à effectuer vous-même : le comité d'organisation s'en charge."
    : 'You do not have to book any hotel or transfer yourself: the organising committee takes care of it.')

  // ── Pas à pas ──
  m.saut()
  m.titreSection(fr ? 'Pas à pas' : 'Step by step', fr ? 'Comment cela se déroule concrètement' : 'How it works in practice')

  m.sousTitre(fr ? 'Formalités' : 'Formalities', fr ? 'Visa et formalités' : 'Visa and formalities')
  m.paragraphe(fr
    ? "Les conditions d'entrée au Maroc (visa ou non) varient selon votre nationalité. Nous vous invitons à vous renseigner suffisamment à l'avance auprès du consulat ou de l'ambassade du Royaume du Maroc dans votre pays de résidence."
    : 'Entry conditions for Morocco (visa or not) vary according to your nationality. Please enquire well in advance with the consulate or embassy of the Kingdom of Morocco in your country of residence.')
  m.paragraphe(fr
    ? "Les démarches de visa sont à votre charge. COPAF ne délivre pas de lettre de soutien. Le document officiel remis est la Confirmation d'inscription, signée par le Dr ODAH."
    : 'Visa procedures are your responsibility. COPAF does not issue support letters. The official document provided is the Registration Confirmation, signed by Dr ODAH.')

  m.sousTitre(fr ? 'Préparation' : 'Preparation', fr ? 'Avant votre départ' : 'Before you leave')
  m.paragraphe(fr ? 'Une seule étape, environ 3 minutes. Rendez-vous sur copaf-ports.com/badge et renseignez :' : 'A single step, about 3 minutes. Go to copaf-ports.com/badge and fill in:')
  m.puces(fr
    ? ['votre photo ;', "votre numéro de passeport, avec votre nom et prénom tels qu'ils sont écrits sur le passeport ;", 'vos informations de vol (aller et retour) : compagnie, numéro de vol, date et heure d\'arrivée et de départ.']
    : ['your photo;', 'your passport number, with your first and last name exactly as written on the passport;', 'your flight information (outbound and return): airline, flight number, date and time of arrival and departure.'])
  m.paragraphe(fr
    ? `Vous préférez ne rien saisir ? Déposez simplement votre billet d'avion (PDF ou photo) au même endroit, ou envoyez-le à ${f('contact_billet')}, nous nous occupons du reste.`
    : `Prefer not to type anything? Simply upload your plane ticket (PDF or photo) in the same place, or send it to ${f('contact_billet')}, and we take care of the rest.`)
  m.paragraphe(fr
    ? "Vous recevrez ensuite par email votre Fiche de Voyage individuelle : hôtel, adresse, numéro de confirmation et modalités de transfert. Elle sera aussi disponible sur copaf-ports.com/verifier."
    : 'You will then receive your individual Travel Sheet by email: hotel, address, confirmation number and transfer details. It will also be available at copaf-ports.com/verifier.')
  m.note(fr
    ? `Vos informations de vol nous sont indispensables pour organiser votre accueil et vos transferts. Merci de nous les transmettre avant le ${f('date_limite_vols')}.`
    : `Your flight information is essential for us to organise your welcome and transfers. Please send it to us before ${f('date_limite_vols')}.`)

  m.sousTitre(fr ? '18 octobre' : '18 October', fr ? 'À votre arrivée à Casablanca' : 'When you arrive in Casablanca')
  m.paragraphe(fr
    ? "À votre sortie de l'aéroport Mohammed V, un représentant de CRF Perfection ou de son partenaire logistique vous accueille et vous conduit à votre hôtel. Le point de rencontre et le moyen de reconnaissance figurent dans votre Fiche de Voyage."
    : 'As you leave Mohammed V Airport, a representative of CRF Perfection or its logistics partner welcomes you and takes you to your hotel. The meeting point and how to recognise them are shown in your Travel Sheet.')

  m.sousTitre(fr ? '19 – 21 octobre' : '19 – 21 October', fr ? 'Pendant la conférence' : 'During the conference')
  m.puces(fr
    ? [
      "Navette quotidienne : une navette assure chaque jour la liaison entre votre hôtel et le Port de Casablanca. Les horaires de départ sont communiqués sur place et affichés dans le hall de votre hôtel.",
      `Retrait du badge et accueil : ${f('badge_lieu_horaires')}. Le port du badge est obligatoire pendant tout l'événement.`,
      "Accès au port : le port est une zone à accès réglementé. Munissez-vous de votre pièce d'identité et suivez les consignes de sécurité communiquées par les organisateurs, en particulier lors de la visite du Jour 3.",
      `Jour 3, immersion terrain : visite technique du Port de Casablanca (infrastructures IT et IA). Rendez-vous : ${f('jour3_rdv')}.`,
      "Photos et vidéos : l'événement est retransmis en direct sur YouTube (@copafports). En participant, vous acceptez d'apparaître sur les captations.",
    ]
    : [
      'Daily shuttle: a shuttle runs every day between your hotel and the Port of Casablanca. Departure times are announced on site and posted in your hotel lobby.',
      `Badge pick-up and welcome: ${f('badge_lieu_horaires')}. Wearing the badge is mandatory throughout the event.`,
      'Port access: the port is a restricted-access area. Bring your ID and follow the security instructions given by the organisers, especially during the Day 3 visit.',
      `Day 3, field immersion: technical visit of the Port of Casablanca (IT and AI infrastructure). Meeting point: ${f('jour3_rdv')}.`,
      'Photos and videos: the event is streamed live on YouTube (@copafports). By taking part, you agree to appear in the recordings.',
    ])

  m.sousTitre(fr ? '22 octobre' : '22 October', fr ? 'À votre départ' : 'When you leave')
  m.paragraphe(fr
    ? "Un transfert retour vers l'aéroport Mohammed V est organisé selon l'horaire de votre vol. Merci de vous assurer que vos informations de vol retour sont à jour dans votre dossier."
    : 'A return transfer to Mohammed V Airport is organised according to your flight time. Please make sure your return flight information is up to date in your file.')

  m.sousTitre(fr ? 'Ensuite' : 'Afterwards', fr ? "Après l'événement" : 'After the event')
  m.puces(fr
    ? [`Attestation de participation : remise à la clôture du Jour 2 ${f('attestation_mode')}.`, 'Replays et supports : disponibles sur copaf-ports.com et sur la chaîne YouTube @copafports.']
    : [`Certificate of participation: handed out at the close of Day 2 ${f('attestation_mode')}.`, 'Replays and materials: available on copaf-ports.com and on the YouTube channel @copafports.'])

  // ── Bon à savoir ──
  m.titreSection(fr ? 'Bon à savoir' : 'Good to know', fr ? 'Informations pratiques' : 'Practical information')
  m.cartes([
    { etiquette: fr ? 'Monnaie' : 'Currency', valeur: fr ? 'Dirham marocain (MAD)' : 'Moroccan dirham (MAD)' },
    { etiquette: fr ? 'Tenue' : 'Dress code', valeur: fr ? 'Business pour les Jours 1 et 2' : 'Business attire for Days 1 and 2', detail: fr ? 'Tenue confortable pour la visite du Jour 3' : 'Comfortable clothing for the Day 3 visit' },
    { etiquette: fr ? 'Climat en octobre' : 'Weather in October', valeur: f('climat') },
    { etiquette: fr ? 'Prises électriques' : 'Power sockets', valeur: f('prises') },
    { etiquette: fr ? 'Connexion' : 'Connectivity', valeur: f('wifi') },
    { etiquette: fr ? "Point d'accueil" : 'Welcome desk', valeur: fr ? "Présent à l'hôtel pendant toute la durée du séjour" : 'At the hotel throughout the stay', detail: fr ? "Comité d'organisation" : 'Organising committee' },
  ])

  // ── Contacts ──
  m.titreSection(fr ? 'Contacts utiles' : 'Useful contacts', fr ? 'Une question ? Nous sommes là' : 'A question? We are here')
  m.cartes([
    { etiquette: fr ? "Comité d'organisation COPAF 2026" : 'COPAF 2026 organising committee', valeur: 'CRF Perfection', detail: f('contact_comite') },
    { etiquette: fr ? 'Espace participant, badge, aspects techniques' : 'Participant area, badge, technical matters', valeur: 'Rénato TCHOBO', detail: f('contact_technique') },
    { etiquette: fr ? 'Transferts et logistique à Casablanca' : 'Transfers and logistics in Casablanca', valeur: fr ? 'Référent sur place' : 'On-site contact', detail: f('contact_logistique') },
    { etiquette: fr ? 'Urgence 24h/24 pendant la conférence' : '24/7 emergency during the conference', valeur: f('contact_urgence') },
  ])

  // ── Espace participant ──
  m.titreSection(fr ? 'Votre espace participant' : 'Your participant area', fr ? 'Tout votre dossier, au même endroit' : 'Your whole file, in one place')
  m.paragraphe(fr
    ? "L'ensemble des documents liés à votre participation (confirmation d'inscription, programme, Fiche de Voyage individuelle, supports des sessions) est mis à votre disposition et actualisé au fil du temps sur votre espace participant, accessible avec votre numéro de dossier et votre adresse email d'inscription."
    : 'All the documents related to your participation (registration confirmation, programme, individual Travel Sheet, session materials) are made available and updated over time in your participant area, accessible with your file number and registration email address.')
  m.paragraphe('copaf-ports.com/verifier', { style: 'bold', color: SKY, size: 11 })
}

// ─── Guide ─────────────────────────────────────────────────────────────────
/**
 * @param {object} p
 * @param {object} p.config   - guide_config.valeurs : { fr: {...}, en: {...} }
 * @param {'fr'|'en'} p.lang
 * @param {boolean} [p.download=false]
 * @returns {Promise<{ doc: jsPDF, manquants: string[], filename: string }>}
 */
export async function generateGuidePDF({ config, lang = 'fr', download = false }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const font = await embarquerPoppins(doc)

  // Couverture
  doc.setFillColor(...NAVY); doc.rect(0, 0, PAGE.w, PAGE.h, 'F')
  try {
    doc.setGState(new doc.GState({ opacity: 0.10 }))
    doc.setFillColor(...SKY); doc.circle(185, 40, 70, 'F'); doc.circle(20, 250, 60, 'F')
    doc.setGState(new doc.GState({ opacity: 0.06 }))
    doc.setFillColor(255, 255, 255); doc.circle(150, 120, 45, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))
  } catch { /* GState indisponible : couverture unie */ }
  doc.setFont(font, 'bold'); doc.setFontSize(9); doc.setTextColor(...SKY)
  doc.text('COPAF 2026', M, 36)
  doc.setFontSize(9); doc.setTextColor(200, 220, 245); doc.setFont(font, 'normal')
  doc.text(L.coverConf.toUpperCase(), M, 42)
  doc.setFont(font, 'bold'); doc.setFontSize(34); doc.setTextColor(255, 255, 255)
  doc.splitTextToSize(L.coverTitre, CW).forEach((t, i) => doc.text(t, M, 78 + i * 15))
  doc.setFillColor(...SKY); doc.rect(M, 112, 22, 1.4, 'F')
  doc.setFont(font, 'normal'); doc.setFontSize(13); doc.setTextColor(215, 230, 250)
  L.coverSous.split('\n').forEach((t, i) => doc.text(t, M, 124 + i * 7))
  doc.setFont(font, 'bold'); doc.setFontSize(11.5); doc.setTextColor(255, 255, 255)
  doc.splitTextToSize(L.coverTheme, CW - 20).forEach((t, i) => doc.text(t, M, 160 + i * 6.5))
  doc.setFont(font, 'normal'); doc.setFontSize(10.5); doc.setTextColor(...SKY)
  doc.text(L.coverDate, M, 198)

  // Bandeau partenaires (logos sur carte blanche)
  const logos = await Promise.all([logo('/logocrf.png'), logo('/logoagpaoc.png'), logo('/ANP.png')])
  doc.setFillColor(255, 255, 255); doc.roundedRect(M, 222, CW, 42, 4, 4, 'F')
  const colW = CW / 3
  L.partenaires.forEach(([nom, role], i) => {
    const cx = M + colW * i + colW / 2
    const lg = logos[i]
    if (lg) {
      const h = 14; const w = Math.min(colW - 14, h * lg.ratio)
      doc.addImage(lg.data, 'JPEG', cx - w / 2, 228, w, w / lg.ratio)
    } else {
      doc.setFont(font, 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text(nom, cx, 238, { align: 'center' })
    }
    doc.setFont(font, 'bold'); doc.setFontSize(7.5); doc.setTextColor(...NAVY); doc.text(role, cx, 255, { align: 'center' })
  })
  doc.setFont(font, 'normal'); doc.setFontSize(9.5); doc.setTextColor(200, 220, 245)
  doc.text('copaf-ports.com', PAGE.w / 2, 280, { align: 'center' })

  // Contenu
  doc.addPage()
  const m = moteur(doc, font)
  contenuGuide(m, config, lang)
  pieds(doc, L.pied, font)
  if (m.etat.manquants.size) {
    doc.setPage(2); pastilleManquante(doc, M, 12, font)
  }

  const filename = `${L.fichier}.pdf`
  if (download) doc.save(filename)
  return { doc, manquants: [...m.etat.manquants], filename }
}

// ─── Fiche de voyage individuelle (gabarit Canva rempli avec pdf-lib) ─────────
//
// Le PDF Canva (public/templates/fiche-voyage-{fr,en}.pdf) sert de FOND ; on ecrit
// le texte dans ses 14 cases blanches, detectees a chaque generation (le gabarit peut
// bouger d'un ou deux points). Aucune mise en page a recalculer.

export const CASES_FICHE = [
  'nom', 'dossier', 'organisme', 'vol_aller', 'vol_retour', 'hotel', 'hotel_adresse', 'hotel_confirmation',
  'pickup', 'chauffeur', 'navette', 'retour_transfert', 'referent_nom', 'referent_tel',
]

// Champs obligatoires avant de marquer la fiche "prete" / de l'envoyer (l'hotel n'a pas
// de categorie par defaut : elle doit etre saisie).
export const FICHE_CHAMPS_REQUIS = ['hotel', 'hotel_categorie', 'hotel_adresse', 'hotel_confirmation', 'pickup', 'chauffeur', 'retour_transfert']

const COULEUR_TEXTE = rgb(10 / 255, 31 / 255, 61 / 255)   // #0A1F3D
const COULEUR_CATEGORIE = rgb(0, 0, 173 / 255)             // #0000AD
const MARGE_G = 4
const TAILLE = 9.5
const TAILLE_MIN = 7.5

const FICHE_TXT = {
  fr: { aCommuniquer: 'À communiquer', fichier: d => `Fiche_Voyage_${d}` },
  en: { aCommuniquer: 'To be provided', fichier: d => `Travel_Sheet_${d}` },
}

const formatDateVol = d => (d || '').replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1')
const formatHeureVol = h => (h || '').replace(/^(\d{1,2})[:hH](\d{2})$/, '$1h$2')

function ligneVol(vol, L) {
  if (!vol) return L.aCommuniquer
  const p = [L1([vol.compagnie, vol.numero].filter(Boolean).join(' ')), formatDateVol(vol.date), formatHeureVol(vol.heure)].filter(Boolean)
  return p.length ? p.join(' · ') : L.aCommuniquer
}

let cacheCrochets = null
// Refuse un gabarit qui cacherait un texte entre crochets (placeholder oublie sous une case).
async function gabaritSansCrochets(octets, url) {
  if (cacheCrochets?.url === url) return cacheCrochets.ok
  let ok = true
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const worker = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = worker
    const pdf = await pdfjs.getDocument({ data: octets.slice() }).promise
    for (let i = 1; i <= pdf.numPages; i++) {
      const tc = await (await pdf.getPage(i)).getTextContent()
      if (/[[\]]/.test(tc.items.map(t => t.str).join(' '))) { ok = false; break }
    }
  } catch (e) {
    console.warn('Controle des crochets du gabarit indisponible :', e)
  }
  cacheCrochets = { url, ok }
  return ok
}

function nettoyerTexte(texte, jeu) {
  let remplace = false
  let out = ''
  for (const ch of String(texte || '').replace(/\s+/g, ' ').trim()) {
    const cp = ch.codePointAt(0)
    if (jeu.has(cp)) { out += ch; continue }
    const base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (base && [...base].every(c => jeu.has(c.codePointAt(0)))) { out += base; remplace = true; continue }
    out += '?'; remplace = true
  }
  return { texte: out, remplace }
}

// Ajuste la taille (TAILLE -> TAILLE_MIN) puis tronque avec "…" ; renvoie le texte et la taille
function ajuster(font, texte, largeurMax, taille = TAILLE) {
  let size = taille
  while (font.widthOfTextAtSize(texte, size) > largeurMax && size > TAILLE_MIN) size -= 0.25
  let t = texte
  let tronque = false
  if (font.widthOfTextAtSize(t, size) > largeurMax) {
    tronque = true
    while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > largeurMax) t = t.slice(0, -1)
    t = t.trimEnd() + '…'
  }
  return { texte: t, size, tronque }
}

/**
 * @param {object} p
 * @param {object} p.voyage - { dossier, nom, prenom, organisation, vol_aller, vol_retour, fiche: {hotel, hotel_categorie, hotel_adresse,
 *                              hotel_confirmation, pickup, chauffeur, retour_transfert, commun?} }
 * @param {object} [p.config] - guide_config.valeurs { fr:{navette, referent_nom, referent_tel...}, en:{...} }
 * @param {'fr'|'en'} p.lang
 * @param {boolean} [p.download=false]
 * @returns {Promise<{ octets: Uint8Array, filename: string, tronques: string[], remplaces: string[] }>}
 */
export async function generateFichePDF({ voyage, config, lang = 'fr', download = false }) {
  const L = FICHE_TXT[lang] || FICHE_TXT.fr
  const url = `/templates/fiche-voyage-${lang === 'en' ? 'en' : 'fr'}.pdf`
  const fiche = voyage.fiche || {}
  const commun = fiche.commun || {}
  const cfg = { fr: { ...(commun.fr || {}), ...(config?.fr || {}) }, en: { ...(commun.en || {}), ...(config?.en || {}) } }

  const gabarit = new Uint8Array(await chargerBinaire(url))
  const pdf = await PDFDocument.load(gabarit)
  const page = pdf.getPages()[0]

  // ── Controles du gabarit ──
  const { cases, formes, hautPage, hauteurPage } = detecterCasesPage(page)
  if (cases.length !== CASES_FICHE.length) {
    throw new Error(`Gabarit de fiche invalide : ${CASES_FICHE.length} cases blanches attendues, ${cases.length} trouvées. Vérifiez le fichier ${url}.`)
  }
  if (formes.some(f => f.y1 > hauteurPage + 0.5 || f.y0 < -0.5)) {
    throw new Error(`Gabarit de fiche invalide : une forme dépasse de la page (${url}).`)
  }
  if (!(await gabaritSansCrochets(gabarit, url))) {
    throw new Error(`Gabarit de fiche invalide : texte entre crochets détecté (placeholder oublié ?) dans ${url}.`)
  }

  pdf.registerFontkit(fontkit)
  const [medium, bold] = await Promise.all([chargerBinaire('/fonts/Poppins-Medium.ttf'), chargerBinaire('/fonts/Poppins-Bold.ttf')])
  const fMedium = await pdf.embedFont(medium, { subset: true })
  const fBold = await pdf.embedFont(bold, { subset: true })
  const jeuMedium = new Set(fMedium.getCharacterSet())
  const jeuBold = new Set(fBold.getCharacterSet())

  const val = (cle) => valeurChamp(cfg, lang, cle)
  const valeurs = {
    nom: L1(`${voyage.prenom || ''} ${voyage.nom || ''}`),
    dossier: voyage.dossier,
    organisme: voyage.organisation,
    vol_aller: ligneVol(voyage.vol_aller, L),
    vol_retour: ligneVol(voyage.vol_retour, L),
    hotel: fiche.hotel,
    hotel_adresse: fiche.hotel_adresse,
    hotel_confirmation: fiche.hotel_confirmation,
    pickup: fiche.pickup,
    chauffeur: fiche.chauffeur,
    navette: val('navette'),
    retour_transfert: fiche.retour_transfert,
    referent_nom: val('referent_nom'),
    referent_tel: val('referent_tel'),
  }

  const tronques = []
  const remplaces = []
  const ecrire = (cle, texteBrut, boite, font, jeu, couleur, taille) => {
    const { texte, remplace } = nettoyerTexte(texteBrut, jeu)
    if (remplace) remplaces.push(cle)
    if (!texte) return
    const largeur = boite.x1 - boite.x0 - MARGE_G * 2
    const r = ajuster(font, texte, largeur, taille)
    if (r.tronque) tronques.push(cle)
    const milieu = hautPage - (boite.y0 + boite.y1) / 2
    page.drawText(r.texte, { x: boite.x0 + MARGE_G, y: milieu - r.size * 0.35, size: r.size, font, color: couleur })
  }

  CASES_FICHE.forEach((cle, i) => ecrire(cle, valeurs[cle], cases[i], fMedium, jeuMedium, COULEUR_TEXTE, TAILLE))

  // Categorie : pas de case, texte pose directement sur le fond gris (x = 169 pt, centre sur le libelle, jusqu'a x = 543)
  ecrire('hotel_categorie', fiche.hotel_categorie, { x0: 169 - MARGE_G, x1: 543 + MARGE_G, y0: 411, y1: 424 }, fBold, jeuBold, COULEUR_CATEGORIE, 9.5)

  const octets = await pdf.save()
  const filename = `${L.fichier(voyage.dossier || 'dossier')}.pdf`
  if (download) telechargerOctets(octets, filename)
  return { octets, filename, tronques, remplaces }
}

// ─── Aides pour les PDF en octets ───────────────────────────────────────────
export function octetsEnBase64(octets) {
  return versBase64(octets)
}

export function ouvrirOctets(octets) {
  window.open(URL.createObjectURL(new Blob([octets], { type: 'application/pdf' })), '_blank', 'noopener')
}

export function telechargerOctets(octets, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([octets], { type: 'application/pdf' }))
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
