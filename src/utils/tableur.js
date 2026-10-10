// src/utils/tableur.js
//
// Lecture / écriture de tableurs sans dépendance supplémentaire : un .xlsx est un ZIP de fichiers XML (JSZip est déjà dans le projet),
// et le CSV est lu/écrit à la main. Sert à l'import et à l'export des attestations.
//   lireTableur(file | ArrayBuffer, nom) → Promise<string[][]>   (xlsx, csv, tsv ; première feuille)
//   ecrireXlsx(lignes) → Promise<Blob>      ecrireCsv(lignes) → Blob (UTF-8 avec BOM, séparateur « ; » pour Excel FR)

import JSZip from 'jszip'

const decoderXml = s => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
const echapperXml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const textesDe = xml => {
  const parts = []
  String(xml).replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g, (m, t) => { parts.push(decoderXml(t)); return m })
  return parts.join('')
}
const colonneVersIndex = ref => {
  const lettres = String(ref).replace(/[^A-Z]/gi, '').toUpperCase()
  let n = 0
  for (let i = 0; i < lettres.length; i++) n = n * 26 + (lettres.charCodeAt(i) - 64)
  return n - 1
}

async function lireXlsx(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const partages = []
  const sst = zip.file('xl/sharedStrings.xml')
  if (sst) {
    const xml = await sst.async('string')
    xml.replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g, (m, si) => { partages.push(textesDe(si)); return m })
  }
  // première feuille : celle du classeur si on la trouve, sinon sheet1.xml
  let chemin = 'xl/worksheets/sheet1.xml'
  const wb = zip.file('xl/workbook.xml')
  const rels = zip.file('xl/_rels/workbook.xml.rels')
  if (wb && rels) {
    const rid = (/<sheet\b[^>]*r:id="([^"]+)"/.exec(await wb.async('string')) || [])[1]
    const relsXml = await rels.async('string')
    const rel = new RegExp(`<Relationship\\b[^>]*Id="${rid}"[^>]*>`).exec(relsXml)
    const cible = rel && /Target="([^"]+)"/.exec(rel[0])
    if (cible) chemin = `xl/${cible[1].replace(/^\/?(xl\/)?/, '')}`
  }
  const feuille = zip.file(chemin) || zip.file('xl/worksheets/sheet1.xml')
  if (!feuille) throw new Error('Feuille introuvable dans le fichier Excel')
  const xml = await feuille.async('string')

  const lignes = []
  xml.replace(/<row\b[^>]*>([\s\S]*?)<\/row>/g, (m, rowXml) => {
    const ligne = []
    rowXml.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, (mc, attrs, inner) => {
      const ref = (/\br="([A-Z]+\d+)"/.exec(attrs) || [])[1]
      const type = (/\bt="([^"]+)"/.exec(attrs) || [])[1]
      let valeur = ''
      if (inner) {
        if (type === 's') valeur = partages[Number((/<v>([\s\S]*?)<\/v>/.exec(inner) || [])[1])] ?? ''
        else if (type === 'inlineStr') valeur = textesDe(inner)
        else valeur = decoderXml((/<v>([\s\S]*?)<\/v>/.exec(inner) || [])[1] ?? '')
      }
      const idx = ref ? colonneVersIndex(ref) : ligne.length
      while (ligne.length < idx) ligne.push('')
      ligne[idx] = valeur
      return mc
    })
    lignes.push(ligne)
    return m
  })
  return lignes
}

function lireCsv(texte) {
  const brut = String(texte).replace(/^\uFEFF/, '')
  const premiere = brut.split(/\r?\n/, 1)[0] || ''
  const sep = [';', '\t', ','].map(c => [c, premiere.split(c).length]).sort((a, b) => b[1] - a[1])[0][0]
  const lignes = []
  let ligne = []
  let champ = ''
  let guillemets = false
  for (let i = 0; i < brut.length; i++) {
    const c = brut[i]
    if (guillemets) {
      if (c === '"') { if (brut[i + 1] === '"') { champ += '"'; i++ } else guillemets = false } else champ += c
    } else if (c === '"') guillemets = true
    else if (c === sep) { ligne.push(champ); champ = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && brut[i + 1] === '\n') i++
      ligne.push(champ); champ = ''
      lignes.push(ligne); ligne = []
    } else champ += c
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne) }
  return lignes
}

export async function lireTableur(source, nom = '') {
  const buffer = source instanceof ArrayBuffer ? source : await source.arrayBuffer()
  const octets = new Uint8Array(buffer)
  const estZip = octets[0] === 0x50 && octets[1] === 0x4b // « PK » : fichier .xlsx
  const lignes = estZip ? await lireXlsx(buffer) : lireCsv(new TextDecoder('utf-8').decode(buffer))
  void nom
  return lignes.map(l => l.map(v => String(v ?? '').trim())).filter(l => l.some(v => v !== ''))
}

const lettreColonne = i => { let s = ''; let n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26) } return s }

export async function ecrireXlsx(lignes, { nomFeuille = 'Feuille1', largeurs = [] } = {}) {
  const rows = lignes.map((l, r) =>
    `<row r="${r + 1}">${l.map((v, c) => `<c r="${lettreColonne(c)}${r + 1}" t="inlineStr"${r === 0 ? ' s="1"' : ''}><is><t xml:space="preserve">${echapperXml(v)}</t></is></c>`).join('')}</row>`).join('')
  const cols = largeurs.length ? `<cols>${largeurs.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''
  const nbCol = Math.max(1, ...lignes.map(l => l.length))
  const feuille = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${cols}<sheetData>${rows}</sheetData><autoFilter ref="A1:${lettreColonne(nbCol - 1)}${Math.max(1, lignes.length)}"/></worksheet>`
  const zip = new JSZip()
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>')
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${echapperXml(nomFeuille)}" sheetId="1" r:id="rId1"/></sheets></workbook>`)
  zip.file('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
  zip.file('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>')
  zip.file('xl/worksheets/sheet1.xml', feuille)
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', compression: 'DEFLATE' })
}

export function ecrireCsv(lignes) {
  const cellule = v => { const s = String(v ?? ''); return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  return new Blob(['﻿' + lignes.map(l => l.map(cellule).join(';')).join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' })
}

export function telecharger(blob, nomFichier) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
