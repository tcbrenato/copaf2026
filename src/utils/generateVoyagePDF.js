// src/utils/generateVoyagePDF.js
//
// Guide du participant (identique pour tous) et Fiche de voyage individuelle,
// en francais ET en anglais, generes dans le navigateur (jsPDF) a partir des
// donnees saisies dans l'admin — aucun Word / LibreOffice requis.
//
// Design repris du kit fourni : bleu marine #00367F, bleu ciel #1798F4, cartes
// #F4F8FC, police Poppins, pastilles d'icones (public/guide-icons), couverture a cercles.
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
const INK = [10, 31, 61]
const TEXT = [51, 65, 85]
const MUTED = [100, 116, 139]
const CLAIR = [206, 222, 244]   // texte clair sur fond marine
const NOTE_BG = [232, 241, 251]
const JAUNE = [255, 241, 166]   // surlignage d'un champ manquant (apercu)

const PAGE = { w: 210, h: 297 }
const M = 18                    // couverture
const CW = PAGE.w - 2 * M
const X0 = 16                   // contenu
const LW = PAGE.w - 2 * X0
const HAUT = 20
const BAS = PAGE.h - 20

// ─── Champs du guide (saisis par l'admin) ──────────────────────────────────
// `defaut` : valeur prerempliee dans l'admin (modifiable), commune aux deux langues (texte) ou par langue ({ fr, en }).
// `type: 'choix'` : choix Oui / Non sans valeur par defaut.
export const GUIDE_FIELDS = [
  { key: 'programme_url', fr: 'Lien du programme', en: 'Programme link', hint: 'https://copaf-ports.com/#programme', defaut: 'https://copaf-ports.com/#programme' },
  { key: 'salle_adresse', fr: 'Adresse de la salle', en: 'Venue address', hint: 'Port de Casablanca, Salle …' },
  { key: 'tablette_conserver', fr: 'La tablette est à conserver par le participant', en: 'The tablet is kept by the participant', type: 'choix' },
  { key: 'contact_billet', fr: 'Contact pour envoyer le billet', en: 'Contact to send the ticket', hint: 'email / WhatsApp',
    defaut: { fr: 'WhatsApp +229 01 69 30 30 19 ou contact@copaf-ports.com', en: 'WhatsApp +229 01 69 30 30 19 or contact@copaf-ports.com' } },
  { key: 'date_limite_vols', fr: 'Date limite pour les infos de vol', en: 'Deadline for flight information', hint: '14 octobre 2026',
    defaut: { fr: '14 octobre 2026', en: '14 October 2026' } },
  { key: 'badge_lieu_horaires', fr: 'Retrait du badge : lieu et horaires', en: 'Badge pick-up: place and times', hint: "Hall d'accueil, dès 8h00" },
  { key: 'jour3_rdv', fr: 'Jour 3 : rendez-vous (lieu et heure)', en: 'Day 3: meeting point (place and time)', hint: "Hall de l'hôtel, 8h30" },
  { key: 'climat', fr: 'Climat en octobre', en: 'Weather in October', hint: '17–25 °C',
    defaut: { fr: 'Environ 17–25 °C, quelques averses possibles', en: 'Around 17–25 °C, occasional showers possible' } },
  { key: 'prises', fr: 'Prises électriques', en: 'Power sockets', hint: 'Type C / E, 220 V', defaut: 'Type C / E, 220 V' },
  { key: 'contact_comite', fr: "Contact : comité d'organisation", en: 'Contact: organising committee', hint: 'Nom · téléphone · email' },
  { key: 'contact_technique', fr: 'Contact : espace participant, badge, technique', en: 'Contact: participant area, badge, technical', hint: 'Rénato TCHOBO · téléphone · email',
    defaut: 'Rénato TCHOBO · +229 01 92 37 77 77 · contact@copaf-ports.com' },
  { key: 'contact_logistique', fr: 'Contact : transferts et logistique à Casablanca', en: 'Contact: transfers and logistics in Casablanca', hint: 'Nom · téléphone local' },
  { key: 'contact_urgence', fr: 'Numéro d’urgence 24h/24', en: '24/7 emergency number', hint: '+212 …' },
  { key: 'navette', fr: 'Navette hôtel → port (fiches de voyage)', en: 'Hotel → port shuttle (travel sheets)', hint: "Départ de l'hôtel à 8h00, du 19 au 21 octobre · rendez-vous dans le hall" },
  { key: 'referent_nom', fr: 'Référent sur place (nom) — fiches de voyage', en: 'On-site contact (name) — travel sheets', hint: 'M. …' },
  { key: 'referent_tel', fr: 'Référent sur place (téléphone) — fiches de voyage', en: 'On-site contact (phone) — travel sheets', hint: '+212 …' },
]

// Champs communs aux fiches de voyage (pas necessaires a l'envoi du guide)
export const CHAMPS_COMMUNS_FICHE = ['navette', 'referent_nom', 'referent_tel']
const CLES_GUIDE = GUIDE_FIELDS.filter(f => !CHAMPS_COMMUNS_FICHE.includes(f.key)).map(f => f.key)

// Texte imprime pour la case « Tablette » selon le choix de l'admin
const TABLETTE = {
  oui: { fr: "Remise sur place, à conserver à l'issue de l'événement", en: 'Handed over on site, yours to keep after the event' },
  non: { fr: "Remise sur place, à restituer à la fin de l'événement", en: 'Handed over on site, to be returned at the end of the event' },
}
export const texteTablette = (choix, lang) => TABLETTE[choix]?.[lang === 'en' ? 'en' : 'fr'] || ''

const defautDe = (champ, lang) => (typeof champ.defaut === 'string' ? champ.defaut : champ.defaut?.[lang]) || ''

function valeurChamp(config, lang, key) {
  const champ = GUIDE_FIELDS.find(f => f.key === key)
  const propre = config?.[lang]?.[key]
  const autre = config?.[lang === 'fr' ? 'en' : 'fr']?.[key]
  const v = String(propre || autre || (champ ? defautDe(champ, lang) : '') || '').replace(/(\*\*|__|<<|>>)/g, '').trim()
  if (champ?.type === 'choix') return v === 'oui' || v === 'non' ? v : ''
  return v
}

// Valeurs du guide avec les valeurs par defaut en plus (pour l'admin) — l'anglais ne prend pas son
// defaut quand un texte francais personnalise existe deja (il reprend alors le francais).
export function configAvecDefauts(valeurs) {
  const sortie = { fr: { ...(valeurs?.fr || {}) }, en: { ...(valeurs?.en || {}) } }
  GUIDE_FIELDS.forEach(champ => {
    ['fr', 'en'].forEach(l => {
      const d = defautDe(champ, l)
      if (!d || String(sortie[l][champ.key] || '').trim()) return
      const frPerso = String(valeurs?.fr?.[champ.key] || '').trim()
      if (l === 'en' && frPerso && frPerso !== defautDe(champ, 'fr')) return
      sortie[l][champ.key] = d
    })
  })
  return sortie
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
    return { data: c.toDataURL('image/jpeg', 0.92), ratio: img.naturalWidth / img.naturalHeight }
  } catch {
    return null
  }
}

// Pastilles d'icones (public/guide-icons/*.png : carre marine arrondi + pictogramme blanc)
const ICONES = ['calendar', 'pin', 'layers', 'langues', 'bed', 'route', 'plane', 'van', 'hotel', 'bus', 'utensils', 'conf', 'ship', 'tablet',
  'award', 'money', 'shirt', 'cloud', 'plug', 'wifi', 'bell', 'users', 'laptop', 'phone']

async function chargerIcones() {
  const res = {}
  await Promise.all(ICONES.map(async nom => {
    try { res[nom] = `data:image/png;base64,${versBase64(await chargerBinaire(`/guide-icons/${nom}.png`))}` } catch { /* pastille vide */ }
  }))
  return res
}

export function pdfEnBase64(doc) {
  const dataUri = doc.output('datauristring')
  return dataUri.slice(dataUri.indexOf('base64,') + 7)
}

// ─── Moteur de mise en page ───────────────────────────────────────────────
// Un « bloc » = { h, apres, dessiner(y) }. m.poser(...blocs) les place ensemble : si l'ensemble ne tient pas
// dans la page, il passe entier a la page suivante (un titre n'est donc jamais separe de son contenu).
const B = t => ({ t, b: true })
const LIEN = (t, url) => ({ t, b: true, lien: url })
const BR = { br: true }
const norm = segs => (Array.isArray(segs) ? segs : [segs]).map(s => (typeof s === 'string' ? { t: s } : s))

function moteur(doc, font, icones, config, lang) {
  let y = HAUT
  const etat = { manquants: new Set() }
  const MM = 0.3528

  const setF = (gras, taille) => { doc.setFont(font, gras ? 'bold' : 'normal'); doc.setFontSize(taille) }
  const larg = (t, gras, taille) => { setF(gras, taille); return doc.getTextWidth(t) }
  const hLigne = taille => taille * MM * 1.55

  // Decoupe en mots (un mot = suite de morceaux de styles differents, sans espace) ; ponctuation double
  // (« : ; ! ? » ») collee au mot precedent pour ne jamais tomber seule en debut de ligne.
  function tokeniser(segs) {
    const toks = []
    let cur = null
    norm(segs).forEach(s => {
      if (s.br) { toks.push({ br: true, pieces: [] }); cur = null; return }
      s.t.split(/( +)/).forEach(p => {
        if (p === '') return
        if (/^ +$/.test(p)) { cur = null; return }
        if (!cur) { cur = { pieces: [] }; toks.push(cur) }
        cur.pieces.push({ ...s, t: p })
      })
    })
    const collee = []
    toks.forEach(tk => {
      const txt = tk.pieces.map(p => p.t).join('')
      const prec = collee[collee.length - 1]
      if (!tk.br && prec && !prec.br && /^[:;!?»]+$/.test(txt)) { prec.pieces.push({ t: ' ' }, ...tk.pieces); return }
      if (prec && !prec.br && !tk.br && prec.pieces.length === 1 && prec.pieces[0].t === '«') { prec.pieces.push({ t: ' ' }, ...tk.pieces); return }
      collee.push(tk)
    })
    return collee
  }

  function lignes(segs, w, taille) {
    const sp = larg(' ', false, taille)
    const res = []
    let cur = { toks: [], w: 0 }
    tokeniser(segs).forEach(tk => {
      if (tk.br) { res.push(cur); cur = { toks: [], w: 0 }; return }
      tk.w = tk.pieces.reduce((a, p) => a + larg(p.t, p.b, taille), 0)
      const ajout = cur.toks.length ? sp + tk.w : tk.w
      if (cur.toks.length && cur.w + ajout > w) { res.push(cur); cur = { toks: [tk], w: tk.w } } else { cur.toks.push(tk); cur.w += ajout }
    })
    if (cur.toks.length) res.push(cur)
    return res
  }

  function ecrire(res, x, yHaut, taille, couleur, { align = 'left', w = 0 } = {}) {
    const lh = hLigne(taille)
    const sp = larg(' ', false, taille)
    res.forEach((ln, i) => {
      let cx = align === 'center' ? x + (w - ln.w) / 2 : x
      const base = yHaut + i * lh + lh * 0.5 + taille * MM * 0.34
      ln.toks.forEach((tk, ti) => {
        if (ti > 0) cx += sp
        tk.pieces.forEach(p => {
          setF(p.b, taille)
          const pw = doc.getTextWidth(p.t)
          if (p.manque) {
            doc.setFillColor(...JAUNE); doc.rect(cx - 0.3, base - taille * MM * 0.85, pw + 0.6, taille * MM * 1.2, 'F')
            doc.setTextColor(...INK)
          } else doc.setTextColor(...(p.lien ? SKY : (p.c || couleur)))
          doc.text(p.t, cx, base)
          if (p.lien) doc.link(cx, base - taille * MM, pw, taille * MM * 1.4, { url: p.lien })
          cx += pw
        })
      })
    })
  }
  const hauteur = (res, taille) => res.length * hLigne(taille)

  // Fleche vectorielle (Poppins n'a pas le glyphe « → »)
  function fleche(x, yc, l, couleur) {
    doc.setDrawColor(...couleur); doc.setLineWidth(0.4); doc.setLineCap('round')
    doc.line(x, yc, x + l, yc); doc.line(x + l - 1.1, yc - 1.1, x + l, yc); doc.line(x + l - 1.1, yc + 1.1, x + l, yc)
  }

  function bouton(x, yb, w, texte, url, h = 7.5) {
    doc.setFillColor(...SKY); doc.rect(x, yb, w, h, 'F')
    const taille = 6.8
    const tw = larg(texte, true, taille)
    const total = tw + 2.4 + 3.2
    const dx = x + (w - total) / 2
    doc.setTextColor(255, 255, 255); doc.text(texte, dx, yb + h / 2 + taille * MM * 0.34)
    fleche(dx + tw + 2.4, yb + h / 2, 3.2, [255, 255, 255])
    if (url) doc.link(x, yb, w, h, { url })
  }

  // Valeur de champ : texte saisi ou [libelle] surligne (compte comme manquant, visible dans l'apercu)
  const champ = key => {
    const v = valeurChamp(config, lang, key)
    if (v) return { t: v }
    etat.manquants.add(key)
    const lab = GUIDE_FIELDS.find(f => f.key === key)?.[lang] || key
    return { t: `[${lab}]`, manque: true }
  }

  const etiquette = (txt, x, yy, couleur = SKY, taille = 6.6) => {
    setF(true, taille); doc.setTextColor(...couleur)
    doc.text(txt.toUpperCase(), x, yy, { charSpace: 0.6 })
  }

  // ── Blocs ──
  const bTitre = (etiq, titre) => ({
    h: 17, apres: 0, avant: 9,
    dessiner: yy => {
      etiquette(etiq, X0, yy + 3)
      setF(true, 21); doc.setTextColor(...INK)
      doc.text(titre, X0, yy + 12.5)
    },
  })

  const bTexte = (segs, { taille = 8.8, couleur = TEXT, apres = 3, align = 'left' } = {}) => {
    const l = lignes(segs, LW, taille)
    return { h: hauteur(l, taille), apres, dessiner: yy => ecrire(l, X0, yy, taille, couleur, { align, w: LW }) }
  }

  const bPanneau = (paras) => {
    const pad = 7
    const w = LW - 2 * pad
    const mes = paras.map(p => {
      const taille = p.taille || 9.4
      return { ...p, taille, l: lignes(p.segs, w, taille), apres: p.apres ?? 3 }
    })
    const h = 2 * pad + mes.reduce((a, p) => a + hauteur(p.l, p.taille) + p.apres, 0) - (mes.at(-1)?.apres || 0)
    return {
      h, apres: 0,
      dessiner: yy => {
        doc.setFillColor(...NAVY); doc.rect(X0, yy, LW, h, 'F')
        let cy = yy + pad
        mes.forEach(p => {
          ecrire(p.l, X0 + pad, cy, p.taille, p.couleur || CLAIR, { align: p.align, w })
          cy += hauteur(p.l, p.taille) + p.apres
        })
      },
    }
  }

  // Grille de cartes a pastille d'icone
  const bGrille = (items, { cols = 3, minH = 34 } = {}) => {
    const gap = 4.5
    const cw = (LW - gap * (cols - 1)) / cols
    const pad = 4.5
    const iw = cw - 2 * pad
    const mes = items.map(it => {
      const lt = lignes([{ t: it.titre, b: true }], iw, 9.4)
      const ld = it.segs ? lignes(it.segs, iw, 7.7) : []
      const h = pad + 10 + 3.2 + hauteur(lt, 9.4) + 0.8 + hauteur(ld, 7.7) + (it.bouton ? 3.5 + 7.5 : 0) + pad
      return { lt, ld, h }
    })
    const rangs = []
    for (let i = 0; i < items.length; i += cols) {
      const idx = items.slice(i, i + cols).map((_, j) => i + j)
      rangs.push({ idx, h: Math.max(minH, ...idx.map(k => mes[k].h)) })
    }
    const h = rangs.reduce((a, r) => a + r.h, 0) + gap * (rangs.length - 1)
    return {
      h, apres: 5,
      dessiner: yy => {
        let cy = yy
        rangs.forEach(r => {
          r.idx.forEach((k, j) => {
            const it = items[k]
            const x = X0 + j * (cw + gap)
            doc.setFillColor(...(it.sombre ? NAVY : CARD)); doc.rect(x, cy, cw, r.h, 'F')
            if (icones[it.icone]) doc.addImage(icones[it.icone], 'PNG', x + pad, cy + pad, 10, 10, it.icone)
            else { doc.setFillColor(...NAVY); doc.roundedRect(x + pad, cy + pad, 10, 10, 2, 2, 'F') }
            let ty = cy + pad + 10 + 3.2
            ecrire(mes[k].lt, x + pad, ty, 9.4, it.sombre ? [255, 255, 255] : INK)
            ty += hauteur(mes[k].lt, 9.4) + 0.8
            ecrire(mes[k].ld, x + pad, ty, 7.7, it.sombre ? CLAIR : MUTED)
            if (it.bouton) bouton(x + pad, cy + r.h - pad - 7.5, iw, it.bouton.texte, it.bouton.url)
          })
          cy += r.h + gap
        })
      },
    }
  }

  // Note pleine largeur (fond bleu clair, filet ciel)
  const bNote = segs => {
    const l = lignes(segs, LW - 11, 8.6)
    const h = hauteur(l, 8.6) + 8
    return {
      h, apres: 6,
      dessiner: yy => {
        doc.setFillColor(...NOTE_BG); doc.rect(X0, yy, LW, h, 'F')
        doc.setFillColor(...SKY); doc.rect(X0, yy, 1.2, h, 'F')
        ecrire(l, X0 + 7, yy + 4, 8.6, NAVY)
      },
    }
  }

  // Bande d'etape : colonne marine (etiquette + titre) a gauche, contenu sur fond clair a droite
  const bBande = ({ etiq, titre, contenu }) => {
    const gw = 42
    const pad = 5
    const w = LW - gw - 2 * pad
    const lt = lignes([{ t: titre, b: true }], gw - 9, 10.2)
    const mes = contenu.map(c => {
      if (c.type === 'puces') {
        const items = c.items.map(s => lignes(s, w - 5, 8.6))
        return { ...c, items, h: items.reduce((a, l) => a + hauteur(l, 8.6) + 1.6, 0) }
      }
      if (c.type === 'note') {
        const l = lignes(c.segs, w - 4, 8.4)
        return { ...c, l, h: hauteur(l, 8.4) + 1 }
      }
      const taille = c.taille || 8.8
      const l = lignes(c.segs, w, taille)
      return { ...c, taille, l, h: hauteur(l, taille) }
    })
    const hContenu = mes.reduce((a, c) => a + c.h + (c.apres ?? 2.2), 0) - (mes.at(-1)?.apres ?? 2.2)
    const h = Math.max(hContenu + 2 * pad, 8 + hauteur(lt, 10.2) + 2 * pad, 24)
    return {
      h, apres: 4,
      dessiner: yy => {
        doc.setFillColor(...CARD); doc.rect(X0 + gw, yy, LW - gw, h, 'F')
        doc.setFillColor(...NAVY); doc.rect(X0, yy, gw, h, 'F')
        etiquette(etiq, X0 + 5, yy + pad + 2, SKY, 6.2)
        ecrire(lt, X0 + 5, yy + pad + 4, 10.2, [255, 255, 255])
        let cy = yy + pad
        mes.forEach(c => {
          const cx = X0 + gw + pad
          if (c.type === 'puces') {
            c.items.forEach(l => {
              doc.setFillColor(...SKY); doc.circle(cx + 1.2, cy + hLigne(8.6) * 0.5, 0.8, 'F')
              ecrire(l, cx + 5, cy, 8.6, TEXT)
              cy += hauteur(l, 8.6) + 1.6
            })
            cy += (c.apres ?? 2.2) - 0
          } else if (c.type === 'note') {
            doc.setFillColor(...SKY); doc.rect(cx, cy + 0.5, 0.7, c.h - 1, 'F')
            ecrire(c.l, cx + 4, cy + 0.5, 8.4, NAVY)
            cy += c.h + (c.apres ?? 2.2)
          } else {
            ecrire(c.l, cx, cy, c.taille, c.couleur || TEXT)
            cy += c.h + (c.apres ?? 2.2)
          }
        })
      },
    }
  }

  const bEspace = (etiq, titre, texte, boutonTexte, url) => {
    const pad = 6
    const w = LW - 2 * pad
    const lt = lignes([{ t: titre, b: true }], w, 12.5)
    const lp = lignes(texte, w, 8.6)
    const h = pad + 4 + hauteur(lt, 12.5) + 2 + hauteur(lp, 8.6) + 4 + 8.5 + pad
    return {
      h, apres: 4,
      dessiner: yy => {
        doc.setFillColor(...NAVY); doc.rect(X0, yy, LW, h, 'F')
        etiquette(etiq, X0 + pad, yy + pad + 2, SKY, 6.4)
        let cy = yy + pad + 4
        ecrire(lt, X0 + pad, cy, 12.5, [255, 255, 255]); cy += hauteur(lt, 12.5) + 2
        ecrire(lp, X0 + pad, cy, 8.6, CLAIR); cy += hauteur(lp, 8.6) + 4
        bouton(X0 + pad, cy, w, boutonTexte, url, 8.5)
      },
    }
  }

  const poser = (...blocs) => {
    const avant = y > HAUT + 1 ? (blocs[0].avant || 0) : 0
    const total = avant + blocs.reduce((a, b, i) => a + b.h + (i < blocs.length - 1 ? b.apres : 0), 0)
    if (y + total > BAS && y > HAUT + 1) { doc.addPage(); y = HAUT } else y += avant
    blocs.forEach(b => {
      if (y + b.h > BAS + 0.5) { doc.addPage(); y = HAUT }
      b.dessiner(y)
      y += b.h + b.apres
    })
  }

  return {
    doc, etat, champ, poser, bTitre, bTexte, bPanneau, bGrille, bNote, bBande, bEspace,
    saut: () => { doc.addPage(); y = HAUT },
  }
}

function pieds(doc, gauche, font, mot) {
  const n = doc.getNumberOfPages()
  for (let p = 2; p <= n; p++) {
    doc.setPage(p)
    doc.setDrawColor(212, 226, 244); doc.setLineWidth(0.3); doc.line(X0, PAGE.h - 16, PAGE.w - X0, PAGE.h - 16)
    doc.setFont(font, 'normal'); doc.setFontSize(7.5); doc.setTextColor(...MUTED)
    doc.text(gauche, X0, PAGE.h - 10.5)
    doc.text(`${mot} ${p}`, PAGE.w - X0, PAGE.h - 10.5, { align: 'right' })
  }
}

// Legende affichee UNIQUEMENT dans l'apercu, quand un champ est vide
function legendeManquante(doc, font, lang) {
  doc.setFillColor(...JAUNE); doc.rect(X0, 8, 4, 3.6, 'F')
  doc.setFont(font, 'bold'); doc.setFontSize(7.5); doc.setTextColor(...INK)
  doc.text(lang === 'en' ? '[ ] = field to complete (preview only)' : '[ ] = champ à compléter (aperçu uniquement)', X0 + 6, 10.9)
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
    partenaires: [['CRF Perfection', 'Coordination technique'], ['AGPAOC', 'Haute Autorité de Tutelle'], ['ANP', 'Partenaire Hôte'], ['UAPNA', 'Partenaire']],
    pied: 'COPAF 2026  ·  Guide du participant',
    page: 'Page',
  },
  en: {
    fichier: 'Participant_Guide_COPAF2026',
    coverTitre: 'PARTICIPANT GUIDE',
    coverSous: 'Reception, accommodation, transport\nand practical information',
    coverConf: 'African Ports Conference',
    // Formulation deja utilisee sur le site (le brief de reference propose « African Smart Port … at the Service of Performance »)
    coverTheme: 'Smart African Port: Artificial Intelligence and Cybersecurity for Performance',
    coverDate: '19 – 21 October 2026  ·  Port of Casablanca, Morocco',
    partenaires: [['CRF Perfection', 'Technical Coordination'], ['AGPAOC', 'High Supervisory Authority'], ['ANP', 'Host Partner'], ['UAPNA', 'Partner']],
    pied: 'COPAF 2026  ·  Participant Guide',
    page: 'Page',
  },
}

function contenuGuide(m, lang) {
  const f = key => m.champ(key)
  const fr = lang === 'fr'
  const t = (a, b) => (fr ? a : b)
  const URL_SITE = 'https://copaf-ports.com'

  // ── Page 2 : introduction + essentiel ──
  m.poser(
    m.bTitre(t('Bienvenue', 'Welcome'), 'Introduction'),
    m.bPanneau([
      { segs: t('Mesdames et Messieurs, chers participants,', 'Ladies and Gentlemen, dear participants,'), couleur: [255, 255, 255], taille: 9.8, apres: 3.5 },
      { segs: fr
        ? ["C'est avec un grand plaisir que l'Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre (AGPAOC), le cabinet CRF Perfection et l'Agence Nationale des Ports du Royaume du Maroc vous accueillent à la Conférence des Ports Africains COPAF 2026, du ", { t: '19 au 21 octobre 2026', b: true, c: [255, 255, 255] }, ' au Port de Casablanca, sur le thème :']
        : ['It is with great pleasure that the Port Management Association of West and Central Africa (PMAWCA – AGPAOC), the firm CRF Perfection and the National Ports Agency of the Kingdom of Morocco welcome you to the African Ports Conference COPAF 2026, from ', { t: '19 to 21 October 2026', b: true, c: [255, 255, 255] }, ' at the Port of Casablanca, on the theme:'] },
      { segs: [{ t: fr ? '« Smart Port Africain : Intelligence Artificielle et Cybersécurité au service de la performance »' : '“Smart African Port: Artificial Intelligence and Cybersecurity for Performance”', b: true, c: [255, 255, 255] }], align: 'center', taille: 9.4, apres: 3.5 },
      { segs: t("Ce guide vous accompagne du moment où vous quittez votre pays jusqu'à votre retour : accueil, hébergement, déplacements, formalités et vie sur place. Ainsi, vous pourrez consacrer l'essentiel de votre attention aux échanges, aux rencontres et aux enseignements de ces trois journées.",
        'This guide accompanies you from the moment you leave your country until your return: reception, accommodation, transport, formalities and life on site. This way, you can devote your full attention to the exchanges, the meetings and the lessons of these three days.') },
      { segs: t("Nous vous souhaitons d'ores et déjà un excellent séjour.", 'We wish you an excellent stay.'), apres: 3.5 },
      { segs: [{ t: 'Dr William ODAH', b: true, c: [255, 255, 255] }], apres: 0.5 },
      { segs: [{ t: t('Directeur Général, CRF Perfection', 'Director General, CRF Perfection'), b: true, c: SKY }], taille: 7.4, apres: 0 },
    ]),
  )
  m.poser(
    m.bTitre(t('La COPAF en bref', 'COPAF at a glance'), t("L'essentiel en un coup d'œil", 'The essentials at a glance')),
    m.bGrille([
      { icone: 'calendar', titre: t('Dates de la conférence', 'Conference dates'), segs: t('19, 20 et 21 octobre 2026', '19, 20 and 21 October 2026') },
      { icone: 'pin', titre: t('Lieu', 'Venue'), segs: [t('Port de Casablanca, Maroc', 'Port of Casablanca, Morocco'), BR, f('salle_adresse')] },
      { icone: 'layers', titre: 'Format', segs: t("2 jours de conférence + 1 jour d'immersion terrain (visite technique du port)", '2 conference days + 1 field immersion day (technical visit of the port)') },
      { icone: 'langues', titre: t('Langues', 'Languages'), segs: t('Français et anglais, avec interprétation simultanée', 'French and English, with simultaneous interpretation') },
      { icone: 'bed', titre: t('Séjour organisé', 'Organised stay'), segs: [t('Du 18 au 22 octobre 2026', '18 to 22 October 2026'), BR, t('4 nuitées', '4 nights')] },
      { icone: 'route', sombre: true, titre: t('Programme complet', 'Full programme'), segs: t('Sessions, horaires et intervenants', 'Sessions, schedule and speakers'),
        bouton: { texte: t('VOIR LE PROGRAMME', 'VIEW PROGRAMME'), url: valeurChamp(m.config, lang, 'programme_url') || `${URL_SITE}/#programme` } },
    ], { minH: 46 }),
  )

  // ── Page 3 : séjour + visa ──
  m.saut()
  m.poser(
    m.bTitre(t('Votre séjour', 'Your stay'), t('Ce que prend en charge CRF Perfection', 'What CRF Perfection covers')),
    m.bTexte(t("Dans le cadre de votre participation, CRF Perfection assure l'organisation complète de votre séjour :", 'As part of your participation, CRF Perfection organises your stay in full:'), { taille: 8.6, couleur: MUTED, apres: 4 }),
    m.bGrille([
      { icone: 'plane', titre: t("Accueil à l'aéroport", 'Airport welcome'), segs: t("À l'aéroport Mohammed V, à votre arrivée", 'At Mohammed V Airport, on your arrival') },
      { icone: 'van', titre: t('Transferts', 'Transfers'), segs: t("De l'aéroport à l'hôtel, aller et retour", 'From the airport to the hotel, round trip') },
      { icone: 'hotel', titre: t('Hébergement', 'Accommodation'), segs: [t('Hôtel 4 étoiles · 4 nuitées', '4-star hotel · 4 nights'), BR, t('Du 18 au 22 octobre 2026', '18 to 22 October 2026')] },
      { icone: 'bus', titre: t('Navette quotidienne', 'Daily shuttle'), segs: t("Entre l'hôtel et le Port de Casablanca, chaque jour de la conférence", 'Between the hotel and the Port of Casablanca, every conference day') },
      { icone: 'utensils', titre: t('Repas', 'Meals'), segs: t('Inclus dans votre participation', 'Included in your participation') },
      { icone: 'conf', titre: t('Conférences et ateliers', 'Conferences and workshops'), segs: t("Accès à l'ensemble du programme", 'Access to the whole programme') },
      { icone: 'ship', titre: t('Visite guidée', 'Guided visit'), segs: t('Du Port de Casablanca (Jour 3)', 'Port of Casablanca (Day 3)') },
      { icone: 'tablet', titre: t('Tablette', 'Tablet'), segs: (() => {
        const v = valeurChamp(m.config, lang, 'tablette_conserver')
        return v ? texteTablette(v, lang) : f('tablette_conserver')
      })() },
      { icone: 'award', titre: t('Attestation', 'Certificate'), segs: t('Attestation de participation', 'Certificate of participation') },
    ], { minH: 32 }),
    m.bNote([B(t("Vous n'avez aucune réservation d'hôtel ni de transfert à effectuer vous-même : le comité d'organisation s'en charge.", 'You do not need to book any hotel or transfer yourself: the organising committee takes care of it.'))]),
  )
  m.poser(
    m.bTitre(t('Pas à pas', 'Step by step'), t('Comment cela se déroule concrètement', 'How it works in practice')),
    m.bBande({
      etiq: t('Formalités', 'Formalities'), titre: t('Visa et formalités', 'Visa and formalities'),
      contenu: [{ type: 'puces', items: fr
        ? [
          ["Les conditions d'entrée au Maroc dépendent de votre nationalité. Renseignez-vous suffisamment à l'avance auprès de l'ambassade ou du consulat du Maroc de votre pays, ou sur le portail officiel ", LIEN('acces-maroc.ma', 'https://www.acces-maroc.ma'), " (le e-Visa n'est pas ouvert à toutes les nationalités)."],
          ["Les démarches sont à votre charge et COPAF ne délivre pas de lettre de soutien. Votre ", B("Confirmation d'inscription"), ', signée par le Dr ODAH, peut être présentée à l’appui de votre demande ; son acceptation reste à la décision des autorités.'],
        ]
        : [
          ['Entry requirements for Morocco depend on your nationality. Please check well in advance with the Moroccan embassy or consulate in your country, or on the official portal ', LIEN('acces-maroc.ma', 'https://www.acces-maroc.ma'), ' (the e-Visa is not open to all nationalities).'],
          ['Visa procedures are your responsibility, and COPAF does not issue support letters. Your ', B('Registration Confirmation'), ', signed by Dr ODAH, may be presented in support of your application; acceptance remains at the discretion of the authorities.'],
        ] }],
    }),
  )

  // ── Page 4 : préparation, arrivée, conférence ──
  m.saut()
  m.poser(m.bBande({
    etiq: t('Préparation', 'Preparation'), titre: t('Avant votre départ', 'Before you leave'),
    contenu: [
      { segs: [{ t: t('Une seule étape, environ 3 minutes.', 'One single step, about 3 minutes.'), b: true, c: INK }], taille: 9.2, apres: 1.5 },
      { segs: [t('Rendez-vous sur ', 'Go to '), LIEN('copaf-ports.com/badge', `${URL_SITE}/badge`), t(' et renseignez :', ' and provide:')], apres: 1.5 },
      { type: 'puces', apres: 2.5, items: fr
        ? [['votre photo ;'], ["votre numéro de passeport, avec votre nom et prénom tels qu'ils sont écrits sur le passeport ;"], ["vos informations de vol (aller et retour) : compagnie, numéro de vol, date et heure d'arrivée et de départ."]]
        : [['your photo;'], ['your passport number, with your first and last name exactly as written on the passport;'], ['your flight details (outbound and return): airline, flight number, date and time of arrival and departure.']] },
      { type: 'note', apres: 2.5, segs: [t("Vous préférez ne rien saisir ? Déposez simplement votre billet d'avion (PDF ou photo) au même endroit, ou envoyez-le à ", 'Prefer not to type anything? Simply upload your plane ticket (PDF or photo) in the same place, or send it to '), f('contact_billet'), t(', nous nous occupons du reste.', ', and we will take care of the rest.')] },
      { segs: [t('Vous recevrez ensuite par email votre ', 'You will then receive your '), B(t('Fiche de Voyage individuelle', 'Individual Travel Sheet')), t(" : hôtel, adresse, numéro de confirmation et modalités de transfert. Elle sera aussi disponible sur ", ' by email: hotel, address, confirmation number and transfer details. It will also be available at '), LIEN('copaf-ports.com/verifier', `${URL_SITE}/verifier`), '.'], apres: 2.5 },
      { segs: [t('Vos informations de vol nous sont indispensables pour organiser votre accueil et vos transferts. Merci de nous les transmettre avant le ', 'Your flight details are essential for us to organise your reception and transfers. Please send them to us before '), f('date_limite_vols'), '.'], taille: 7.6, couleur: MUTED },
    ],
  }))
  m.poser(m.bBande({
    etiq: t('18 octobre', '18 October'), titre: t('À votre arrivée à Casablanca', 'When you arrive in Casablanca'),
    contenu: [{ segs: fr
      ? ["À votre sortie de la zone de récupération des bagages et de la douane, dans le hall des arrivées du terminal où atterrit votre vol, un représentant de CRF Perfection ou de son partenaire logistique vous accueille avec un panneau COPAF 2026 et vous conduit à votre hôtel. L'heure et le point de rencontre exacts figurent dans votre ", B('Fiche de Voyage'), '. Si vous ne voyez pas notre représentant, appelez le référent sur place dont le numéro figure sur votre fiche.']
      : ['When you leave the baggage reclaim and customs area, in the arrivals hall of the terminal where your flight lands, a representative of CRF Perfection or its logistics partner will welcome you with a COPAF 2026 sign and take you to your hotel. The exact time and meeting point are shown on your ', B('Individual Travel Sheet'), '. If you cannot see our representative, please call the on-site contact whose number appears on your sheet.'] }],
  }))
  m.poser(m.bBande({
    etiq: t('19 – 21 octobre', '19 – 21 October'), titre: t('Pendant la conférence', 'During the conference'),
    contenu: [{ type: 'puces', items: fr
      ? [
        [B('Navette quotidienne'), " : une navette assure chaque jour la liaison entre votre hôtel et le Port de Casablanca. L'horaire de départ figure dans votre Fiche de Voyage et vous est rappelé au point d'accueil de l'hôtel."],
        [B('Retrait du badge et accueil'), ' : ', f('badge_lieu_horaires'), '. Le port du badge est obligatoire pendant tout l’événement.'],
        [B("Accès au port"), " : le port est une zone à accès réglementé. Munissez-vous de votre pièce d'identité et suivez les consignes de sécurité communiquées par les organisateurs, en particulier lors de la visite du Jour 3."],
        [B('Jour 3, immersion terrain'), ' : visite technique du Port de Casablanca (infrastructures IT et IA). Rendez-vous : ', f('jour3_rdv'), '.'],
        [B('Photos et vidéos'), " : l'événement est retransmis en direct sur YouTube (@copafports). En participant, vous acceptez d'apparaître sur les captations."],
      ]
      : [
        [B('Daily shuttle'), ': a shuttle runs every day between your hotel and the Port of Casablanca. The departure time is shown on your Individual Travel Sheet and is repeated at the hotel welcome desk.'],
        [B('Badge collection and reception'), ': ', f('badge_lieu_horaires'), '. Wearing your badge is mandatory throughout the event.'],
        [B('Access to the port'), ': the port is a restricted-access area. Bring your ID and follow the security instructions given by the organisers, especially during the Day 3 visit.'],
        [B('Day 3, field immersion'), ': technical visit of the Port of Casablanca (IT and AI infrastructure). Meeting point: ', f('jour3_rdv'), '.'],
        [B('Photos and videos'), ': the event is broadcast live on YouTube (@copafports). By participating, you agree to appear in the recordings.'],
      ] }],
  }))

  // ── Page 5 : départ, après, infos pratiques ──
  m.saut()
  m.poser(m.bBande({
    etiq: t('22 octobre', '22 October'), titre: t('À votre départ', 'When you leave'),
    contenu: [{ segs: t("Un transfert retour vers l'aéroport Mohammed V est organisé selon l'horaire de votre vol. Merci de vous assurer que vos informations de vol retour sont à jour dans votre dossier.",
      'A return transfer to Mohammed V Airport is organised according to your flight time. Please make sure your return flight details are up to date in your file.') }],
  }))
  m.poser(m.bBande({
    etiq: t('Ensuite', 'Afterwards'), titre: t("Après l'événement", 'After the event'),
    contenu: [{ type: 'puces', items: fr
      ? [
        [B('Attestation de participation'), ' : remise à la fin de la deuxième journée, et également disponible dans votre espace participant.'],
        [B('Replays et supports'), ' : disponibles sur copaf-ports.com et sur la chaîne YouTube @copafports.'],
      ]
      : [
        [B('Certificate of participation'), ': handed out at the end of Day 2 and also available in your participant area.'],
        [B('Replays and materials'), ': available on copaf-ports.com and on the YouTube channel @copafports.'],
      ] }],
  }))
  m.poser(
    m.bTitre(t('Bon à savoir', 'Good to know'), t('Informations pratiques', 'Practical information')),
    m.bGrille([
      { icone: 'money', titre: t('Monnaie', 'Currency'), segs: t('Dirham marocain (MAD)', 'Moroccan dirham (MAD)') },
      { icone: 'shirt', titre: t('Tenue', 'Dress code'), segs: t('Business pour les Jours 1 et 2, tenue confortable pour la visite du Jour 3', 'Business attire for Days 1 and 2, comfortable clothing for the Day 3 visit') },
      { icone: 'cloud', titre: t('Climat en octobre', 'October weather'), segs: f('climat') },
      { icone: 'plug', titre: t('Prises électriques', 'Power sockets'), segs: f('prises') },
      { icone: 'wifi', titre: t('Connexion', 'Internet'), segs: t("Wi-Fi gratuit à l'hôtel", 'Free Wi-Fi at the hotel') },
      { icone: 'bell', titre: t("Point d'accueil", 'Welcome desk'), segs: t("Un point d'accueil du comité d'organisation est présent à l'hôtel pendant toute la durée du séjour.", 'An organising-committee welcome desk is present at the hotel throughout your stay.') },
    ], { minH: 34 }),
  )

  // ── Page 6 : contacts + espace participant ──
  m.saut()
  m.poser(
    m.bTitre(t('Contacts utiles', 'Useful contacts'), t('Une question ? Nous sommes là', 'Any questions? We are here to help')),
    m.bGrille([
      { icone: 'users', titre: t("Comité d'organisation COPAF 2026", 'COPAF 2026 organising committee'), segs: ['CRF Perfection', BR, f('contact_comite')] },
      { icone: 'laptop', titre: t('Espace participant, badge, aspects techniques', 'Participant area, badge, technical matters'), segs: f('contact_technique') },
      { icone: 'van', titre: t('Transferts et logistique à Casablanca', 'Transfers and logistics in Casablanca'), segs: [t('Référent sur place', 'On-site contact'), BR, f('contact_logistique')] },
      { icone: 'phone', sombre: true, titre: t('Urgence 24h/24 pendant la conférence', '24/7 emergency line during the conference'), segs: f('contact_urgence') },
    ], { cols: 2, minH: 38 }),
    m.bEspace(t('Votre espace participant', 'Your participant area'), t('Tout votre dossier, au même endroit', 'Your whole file, in one place'),
      t("L'ensemble des documents liés à votre participation (confirmation d'inscription, programme, Fiche de Voyage individuelle, supports des sessions) est mis à votre disposition et actualisé au fil du temps sur votre espace participant, accessible avec votre numéro de dossier et votre adresse email d'inscription.",
        'All the documents related to your participation (registration confirmation, programme, Individual Travel Sheet, session materials) are made available to you, and updated over time, in your participant area, accessible with your registration number and the email address you used to register.'),
      t('ACCÉDER À MON ESPACE PARTICIPANT', 'ACCESS MY PARTICIPANT AREA'), `${URL_SITE}/verifier`),
    m.bTexte([{ t: t('Site officiel : ', 'Official website: '), c: MUTED }, LIEN('copaf-ports.com', URL_SITE)], { taille: 8.4, apres: 0, align: 'center' }),
  )
}

// ─── Guide ─────────────────────────────────────────────────────────────────
/**
 * @param {object} p
 * @param {object} p.config   - guide_config.valeurs : { fr: {...}, en: {...} }
 * @param {'fr'|'en'} p.lang
 * @param {boolean} [p.download=false]
 * @param {boolean} [p.apercu=false] - apercu admin : champs vides surlignes + legende (jamais dans un PDF envoye)
 * @returns {Promise<{ doc: jsPDF, manquants: string[], filename: string, pages: number }>}
 */
export async function generateGuidePDF({ config, lang = 'fr', download = false, apercu = false }) {
  const L = TXT[lang] || TXT.fr
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const font = await embarquerPoppins(doc)
  const [icones, logos] = await Promise.all([
    chargerIcones(),
    Promise.all([logo('/logocrf.png'), logo('/logoagpaoc.png'), logo('/ANP.png'), logo('/uapna.png')]),
  ])

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

  // Bandeau partenaires : 4 logos a la meme hauteur, centres dans des colonnes egales
  doc.setFillColor(255, 255, 255); doc.roundedRect(M, 222, CW, 42, 4, 4, 'F')
  const colW = CW / L.partenaires.length
  const HAUT_LOGO = 13
  L.partenaires.forEach(([nom, role], i) => {
    const cx = M + colW * i + colW / 2
    const lg = logos[i]
    if (lg) {
      const w = Math.min(colW - 8, HAUT_LOGO * lg.ratio)
      const h = w / lg.ratio
      doc.addImage(lg.data, 'JPEG', cx - w / 2, 228 + (HAUT_LOGO - h) / 2, w, h)
    } else {
      doc.setFont(font, 'bold'); doc.setFontSize(11); doc.setTextColor(...NAVY); doc.text(nom, cx, 236, { align: 'center' })
    }
    doc.setFont(font, 'bold'); doc.setFontSize(7); doc.setTextColor(...NAVY); doc.text(role, cx, 255, { align: 'center' })
  })
  doc.setFont(font, 'normal'); doc.setFontSize(9.5); doc.setTextColor(200, 220, 245)
  doc.text('copaf-ports.com', PAGE.w / 2, 280, { align: 'center' })

  // Contenu
  doc.addPage()
  const m = moteur(doc, font, icones, config, lang)
  m.config = config
  contenuGuide(m, lang)
  pieds(doc, L.pied, font, L.page)
  if (apercu && m.etat.manquants.size) {
    doc.setPage(2); legendeManquante(doc, font, lang)
  }

  const filename = `${L.fichier}.pdf`
  if (download) doc.save(filename)
  return { doc, manquants: [...m.etat.manquants], filename, pages: doc.getNumberOfPages() }
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
export const FICHE_CHAMPS_REQUIS = ['hotel', 'hotel_categorie', 'hotel_adresse', 'hotel_confirmation', 'pickup', 'chauffeur', 'navette', 'retour_transfert', 'referent_nom', 'referent_tel']

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
    navette: fiche.navette || val('navette'),
    retour_transfert: fiche.retour_transfert,
    referent_nom: fiche.referent_nom || val('referent_nom'),
    referent_tel: fiche.referent_tel || val('referent_tel'),
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
