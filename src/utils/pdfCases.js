// src/utils/pdfCases.js
//
// Detecte, dans un PDF de gabarit (Canva), les "cases" a remplir : rectangles
// remplis en BLANC, largeur > 20 pt et hauteur > 8 pt, hors fonds pleine page
// (largeur >= 590). Petit interpreteur de flux de contenu : suit q/Q, cm, la
// couleur de remplissage, les chemins (re, m/l/h) et descend dans les formes
// (Do) imbriquees, avec leur Matrix.
//
// Coordonnees rendues : points, ORIGINE EN HAUT A GAUCHE de la page visible
// (mediabox comprise : les PDF Canva ont un mediabox decale, y0 != 0).

import { PDFArray, PDFDict, PDFName, PDFNumber, PDFRawStream, PDFStream, decodePDFRawStream } from 'pdf-lib'

const IDENT = [1, 0, 0, 1, 0, 0]
const mult = (m, n) => [
  m[0] * n[0] + m[1] * n[2], m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2], m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4], m[4] * n[1] + m[5] * n[3] + n[5],
]
const applique = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]

// ── Tokenizer ────────────────────────────────────────────────────────────
const ESPACE = new Set([0, 9, 10, 12, 13, 32])
const DELIM = new Set([0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25])

function tokeniser(octets) {
  const out = []
  let i = 0
  const n = octets.length
  while (i < n) {
    const c = octets[i]
    if (ESPACE.has(c)) { i++; continue }
    if (c === 0x25) { while (i < n && octets[i] !== 10 && octets[i] !== 13) i++; continue } // commentaire
    if (c === 0x2f) { // /Nom
      let j = i + 1
      while (j < n && !ESPACE.has(octets[j]) && !DELIM.has(octets[j])) j++
      out.push({ t: 'nom', v: String.fromCharCode(...octets.subarray(i + 1, j)) }); i = j; continue
    }
    if (c === 0x28) { // chaine (...)
      let depth = 1; let j = i + 1
      while (j < n && depth > 0) { if (octets[j] === 0x5c) j++; else if (octets[j] === 0x28) depth++; else if (octets[j] === 0x29) depth--; j++ }
      out.push({ t: 'chaine' }); i = j; continue
    }
    if (c === 0x3c && octets[i + 1] === 0x3c) { // dictionnaire << ... >>
      let depth = 1; let j = i + 2
      while (j < n && depth > 0) {
        if (octets[j] === 0x3c && octets[j + 1] === 0x3c) { depth++; j += 2 } else if (octets[j] === 0x3e && octets[j + 1] === 0x3e) { depth--; j += 2 } else j++
      }
      out.push({ t: 'dict' }); i = j; continue
    }
    if (c === 0x3c) { let j = i + 1; while (j < n && octets[j] !== 0x3e) j++; out.push({ t: 'chaine' }); i = j + 1; continue }
    if (c === 0x5b || c === 0x5d) { out.push({ t: c === 0x5b ? 'tab_ouvre' : 'tab_ferme' }); i++; continue }
    // nombre ou operateur
    let j = i
    while (j < n && !ESPACE.has(octets[j]) && !DELIM.has(octets[j])) j++
    if (j === i) { i++; continue }
    const mot = String.fromCharCode(...octets.subarray(i, j))
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(mot)) out.push({ t: 'num', v: parseFloat(mot) })
    else out.push({ t: 'op', v: mot })
    i = j
  }
  return out
}

function octetsDuFlux(contexte, ref) {
  const s = ref instanceof PDFStream || ref instanceof PDFRawStream ? ref : contexte.lookup(ref)
  return decodePDFRawStream(s).decode()
}

function contenuPage(page) {
  const ctx = page.doc.context
  const c = page.node.Contents()
  const refs = c instanceof PDFArray ? c.asArray() : [c]
  const morceaux = refs.map(r => octetsDuFlux(ctx, r))
  const total = morceaux.reduce((s, m) => s + m.length + 1, 0)
  const tout = new Uint8Array(total)
  let pos = 0
  for (const m of morceaux) { tout.set(m, pos); pos += m.length; tout[pos++] = 10 }
  return tout
}

const estBlanc = c => {
  if (!c) return false
  if (c.type === 'rgb') return c.v.every(x => x >= 0.99)
  if (c.type === 'gray') return c.v[0] >= 0.99
  if (c.type === 'cmyk') return c.v.every(x => x <= 0.01)
  return false
}

/**
 * @param {import('pdf-lib').PDFPage} page
 * @returns {{ cases: {x0:number,y0:number,x1:number,y1:number}[], formes: {x0:number,y0:number,x1:number,y1:number}[] }}
 *   cases : rectangles blancs > 20 x 8 (hors pleine page), origine haut-gauche.
 *   formes : toutes les formes blanches trouvees (utile au diagnostic).
 */
export function detecterCasesPage(page) {
  const ctx = page.doc.context
  const mb = page.getMediaBox()
  const hautPage = mb.y + mb.height
  const blancs = []
  let garde = 0

  const opacite = (resources, nom) => {
    try {
      const gs = resources?.lookup(PDFName.of('ExtGState'))?.lookup(PDFName.of(nom))
      const ca = gs?.lookup(PDFName.of('ca'))
      return ca instanceof PDFNumber ? ca.asNumber() : 1
    } catch { return 1 }
  }

  const executer = (octets, resources, ctmInitiale, etatInitial) => {
    if (++garde > 400) return // securite anti-recursion
    const jetons = tokeniser(octets)
    let ctm = ctmInitiale
    let fill = etatInitial.fill
    let alpha = etatInitial.alpha
    const pile = []
    let args = []
    let rects = [] // rectangles du chemin courant (espace utilisateur -> deja transformes en pt page)
    let sousChemin = []
    let profondeurTab = 0

    const fermerSousChemin = () => {
      if (sousChemin.some(p => !p)) { sousChemin = []; return }
      if (sousChemin.length >= 4) {
        const xs = sousChemin.map(p => p[0]); const ys = sousChemin.map(p => p[1])
        const x0 = Math.min(...xs); const x1 = Math.max(...xs); const y0 = Math.min(...ys); const y1 = Math.max(...ys)
        // sommets tous sur les 4 coins du rectangle englobant => rectangle
        const surCoin = sousChemin.every(p => (Math.abs(p[0] - x0) < 0.01 || Math.abs(p[0] - x1) < 0.01) && (Math.abs(p[1] - y0) < 0.01 || Math.abs(p[1] - y1) < 0.01))
        if (surCoin && sousChemin.length <= 5) rects.push([x0, y0, x1, y1])
      }
      sousChemin = []
    }
    const ajouterRect = (x, y, w, h) => {
      const pts = [applique(ctm, x, y), applique(ctm, x + w, y), applique(ctm, x + w, y + h), applique(ctm, x, y + h)]
      const xs = pts.map(p => p[0]); const ys = pts.map(p => p[1])
      rects.push([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)])
    }
    const remplir = () => {
      fermerSousChemin()
      if (estBlanc(fill) && alpha > 0.5) rects.forEach(r => blancs.push({ x0: r[0], y0: hautPage - r[3], x1: r[2], y1: hautPage - r[1] }))
      rects = []
    }
    const viderChemin = () => { rects = []; sousChemin = [] }
    const nums = () => args.filter(a => a.t === 'num').map(a => a.v)

    for (const j of jetons) {
      if (j.t === 'tab_ouvre') { profondeurTab++; continue }
      if (j.t === 'tab_ferme') { profondeurTab--; continue }
      if (profondeurTab > 0) continue
      if (j.t !== 'op') { args.push(j); continue }
      const op = j.v
      const v = nums()
      switch (op) {
        case 'q': pile.push({ ctm, fill, alpha }); break
        case 'Q': { const s = pile.pop(); if (s) { ctm = s.ctm; fill = s.fill; alpha = s.alpha } break }
        case 'cm': if (v.length === 6) ctm = mult(v, ctm); break
        case 'rg': if (v.length === 3) fill = { type: 'rgb', v }; break
        case 'g': if (v.length === 1) fill = { type: 'gray', v }; break
        case 'k': if (v.length === 4) fill = { type: 'cmyk', v }; break
        case 'sc': case 'scn': fill = v.length === 3 ? { type: 'rgb', v } : v.length === 1 ? { type: 'gray', v } : v.length === 4 ? { type: 'cmyk', v } : null; break
        case 'cs': fill = null; break
        case 'gs': { const nom = args.find(a => a.t === 'nom')?.v; if (nom) alpha = opacite(resources, nom); break }
        case 're': if (v.length === 4) ajouterRect(v[0], v[1], v[2], v[3]); break
        case 'm': fermerSousChemin(); if (v.length === 2) sousChemin.push(applique(ctm, v[0], v[1])); break
        case 'l': if (v.length === 2) sousChemin.push(applique(ctm, v[0], v[1])); break
        case 'c': case 'v': case 'y': sousChemin.push(null); break // courbe : pas un rectangle
        case 'h': fermerSousChemin(); break
        case 'f': case 'F': case 'f*': case 'B': case 'B*': case 'b': case 'b*': remplir(); break
        case 'n': case 'S': case 's': viderChemin(); break
        case 'Do': {
          const nom = args.find(a => a.t === 'nom')?.v
          const xo = resources?.lookup(PDFName.of('XObject'))
          const obj = nom && xo ? xo.lookup(PDFName.of(nom)) : null
          if (obj && (obj instanceof PDFRawStream || obj instanceof PDFStream) && obj.dict.get(PDFName.of('Subtype'))?.toString() === '/Form') {
            const mat = obj.dict.lookup(PDFName.of('Matrix'))
            const m = mat instanceof PDFArray ? mat.asArray().map(x => x.asNumber()) : IDENT
            const res = obj.dict.lookup(PDFName.of('Resources')) || resources
            executer(octetsDuFlux(ctx, obj), res, mult(m, ctm), { fill, alpha })
          }
          break
        }
        default: break
      }
      args = []
    }
  }

  // chemins avec courbe : sousChemin contient des null => jamais un rectangle
  const resPage = page.node.Resources()
  executer(contenuPage(page), resPage, IDENT, { fill: { type: 'gray', v: [0] }, alpha: 1 })

  const valides = blancs.filter(b => Number.isFinite(b.x0) && Number.isFinite(b.y0))
  const cases = valides
    .map(b => ({ ...b, w: b.x1 - b.x0, h: b.y1 - b.y0 }))
    .filter(b => b.w > 20 && b.h > 8 && b.w < 590)
    .sort((a, b) => Math.round(a.y0) - Math.round(b.y0) || a.x0 - b.x0)
    .map(({ x0, y0, x1, y1 }) => ({ x0, y0, x1, y1 }))
  return { cases, formes: valides, hautPage, largeurPage: mb.width, hauteurPage: mb.height }
}
