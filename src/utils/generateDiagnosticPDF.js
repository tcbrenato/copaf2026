// src/utils/generateDiagnosticPDF.js
//
// Genere le rapport officiel du Diagnostic Smart Port COPAF 2026.
//
// Contrairement a une premiere version qui capturait l'ecran en image
// (html2canvas), ce generateur DESSINE le document directement avec
// jsPDF — meme logique que generateProformaPDF.js / generateRecapPDF.js.
// Le radar est calcule mathematiquement (trigonometrie), pas une image :
// rendu net a toute resolution, pagination fiable, fond clair adapte
// a l'impression.

import jsPDF from 'jspdf'

const NAVY     = [0, 14, 145]     // #000E91
const BLUE     = [0, 115, 244]    // #0073F4
const GRAY     = [100, 116, 139]
const DARK     = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]
const LINE     = [226, 232, 240]
const GOLD     = [217, 119, 6]
const GREEN    = [22, 163, 74]
const RED      = [220, 38, 38]

const AXES_LABELS = {
  infrastructure: 'Infrastructure digitale',
  automatisation: 'Automatisation',
  tracabilite: 'Traçabilité & données',
  ia: 'IA & décision',
  cybersecurite: 'Cybersécurité',
  surete: 'Sûreté & sécurité',
  environnement: 'Énergie & environnement',
  synchromodalite: 'Synchromodalité',
  competences: 'Compétences',
  parties_prenantes: 'Parties prenantes',
}

const NOMS_NIVEAUX = ['Nul', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon']

function fmtDateLong(d = new Date()) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function couleurNiveau(v) {
  if (v <= 1) return RED
  if (v <= 3) return GOLD
  return GREEN
}

// ── Calcule les points d'un polygone regulier a N sommets (radar) ──
function pointsPolygone(cx, cy, rayon, n, valeurs = null, maxVal = 5) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    const r = valeurs ? (valeurs[i] / maxVal) * rayon : rayon
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return pts
}

export async function generateDiagnosticPDF({ diag, download = true }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 44
  const contentW = W - M * 2
  let y = 0

  const scores = diag.scores || {}
  const cles = Object.keys(AXES_LABELS)
  const valeurs = cles.map(k => scores[k] ?? 0)
  const moyenne = valeurs.reduce((s, v) => s + v, 0) / valeurs.length

  const drawFooter = () => {
    const footerY = H - 46
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, footerY, W - M, footerY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text('COPAF 2026 — Diagnostic Smart Port', M, footerY + 14)
    doc.text('contact@copaf-ports.com', M, footerY + 24)
    doc.text('www.copaf-ports.com', W - M, footerY + 14, { align: 'right' })
  }

  // Numerotation de sections auto-incrementee (1. DETAIL PAR AXE, 2. CONSTAT
  // GENERAL, etc.) pour que le document se lise comme un vrai rapport
  // structure plutot qu'un export d'ecran.
  let sectionNum = 0
  const sectionTitle = titre => {
    sectionNum += 1
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...NAVY)
    doc.text(`${sectionNum}. ${titre}`, M, y)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, y + 5, W - M, y + 5)
    y += 20
  }
  const pageBreakIfNeeded = neededH => {
    if (y + neededH > H - 70) { drawFooter(); doc.addPage(); y = M }
  }
  const paragraphe = (texte, options = {}) => {
    const { fontSize = 9, fond = false, italique = false, couleur = DARK } = options
    doc.setFont('helvetica', italique ? 'italic' : 'normal')
    doc.setFontSize(fontSize)
    doc.setTextColor(...couleur)
    const wrapped = doc.splitTextToSize(texte, fond ? contentW - 28 : contentW)
    const blocH = wrapped.length * (fontSize + 2.5) + (fond ? 20 : 0)
    pageBreakIfNeeded(blocH)
    if (fond) {
      doc.setFillColor(...LIGHT_BG)
      doc.roundedRect(M, y, contentW, blocH, 8, 8, 'F')
      doc.setFont('helvetica', italique ? 'italic' : 'normal')
      doc.setFontSize(fontSize)
      doc.setTextColor(...couleur)
      doc.text(wrapped, M + 14, y + 15)
    } else {
      doc.text(wrapped, M, y + fontSize)
    }
    y += blocH + 14
  }

  // ══════════════════════════════════════════
  // EN-TETE
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('COPAF 2026 · DIAGNOSTIC SMART PORT', M, M)

  const badgeW = 110
  const badgeH = 40
  doc.setFillColor(...NAVY)
  doc.roundedRect(W - M - badgeW, M - 26, badgeW, badgeH, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(200, 210, 255)
  doc.text('SCORE GLOBAL', W - M - badgeW / 2, M - 12, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text(`${moyenne.toFixed(1)} / 5`, W - M - badgeW / 2, M + 6, { align: 'center' })

  y = M + 8
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1.25)
  doc.line(M, y, W - M, y)
  y += 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.text(diag.organisation || `${diag.prenom} ${diag.nom}`, M, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  doc.text(`${diag.pays || ''}${diag.prenom ? `  ·  Renseigné par ${diag.prenom} ${diag.nom}` : ''}  ·  ${fmtDateLong(new Date(diag.created_at || Date.now()))}`, M, y)
  y += 24

  // ══════════════════════════════════════════
  // RADAR (dessine mathematiquement)
  // ══════════════════════════════════════════
  const radarBoxH = 240
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(M, y, contentW, radarBoxH, 8, 8, 'F')

  const cx = M + contentW / 2
  const cy = y + radarBoxH / 2 + 4
  const rayon = 92
  const n = cles.length

  // Grille (5 anneaux concentriques)
  for (let niveau = 1; niveau <= 5; niveau++) {
    const pts = pointsPolygone(cx, cy, (rayon * niveau) / 5, n)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.5)
    for (let i = 0; i < n; i++) {
      const next = pts[(i + 1) % n]
      doc.line(pts[i][0], pts[i][1], next[0], next[1])
    }
  }
  // Rayons (spokes)
  const spokePts = pointsPolygone(cx, cy, rayon, n)
  spokePts.forEach(p => {
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.5)
    doc.line(cx, cy, p[0], p[1])
  })

  // Polygone de donnees (rempli)
  const dataPts = pointsPolygone(cx, cy, rayon, n, valeurs, 5)
  doc.setFillColor(...BLUE)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1.5)
  doc.lines(
    dataPts.slice(1).map((p, i) => [p[0] - dataPts[i][0], p[1] - dataPts[i][1]]),
    dataPts[0][0], dataPts[0][1],
    [1, 1], 'FD', true,
  )
  // Points sur chaque sommet
  dataPts.forEach(p => {
    doc.setFillColor(...NAVY)
    doc.circle(p[0], p[1], 2, 'F')
  })

  // Labels des axes
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...DARK)
  spokePts.forEach((p, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    const lx = cx + (rayon + 20) * Math.cos(angle)
    const ly = cy + (rayon + 20) * Math.sin(angle)
    const align = Math.cos(angle) > 0.15 ? 'left' : Math.cos(angle) < -0.15 ? 'right' : 'center'
    const label = AXES_LABELS[cles[i]]
    const lines = doc.splitTextToSize(label, 78)
    doc.text(lines, lx, ly, { align })
  })

  y += radarBoxH + 20

  // ══════════════════════════════════════════
  // DETAIL PAR AXE (2 colonnes)
  // ══════════════════════════════════════════
  sectionTitle('DÉTAIL PAR AXE')

  const colGap = 24
  const colW = (contentW - colGap) / 2
  const rowH = 34
  cles.forEach((cle, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + colGap)
    const rowY = y + row * rowH

    const v = valeurs[i]
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text(AXES_LABELS[cle], x, rowY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...couleurNiveau(v))
    doc.text(`${v}/5 · ${NOMS_NIVEAUX[v]}`, x + colW, rowY, { align: 'right' })

    const barY = rowY + 5
    const barW = colW
    doc.setFillColor(...LINE)
    doc.roundedRect(x, barY, barW, 5, 2.5, 2.5, 'F')
    doc.setFillColor(...couleurNiveau(v))
    doc.roundedRect(x, barY, Math.max(6, (barW * v) / 5), 5, 2.5, 2.5, 'F')
  })

  y += Math.ceil(cles.length / 2) * rowH + 14

  // Structure imposee par le DG : le raisonnement doit se lire comme un
  // vrai rapport d'expert, en 2 blocs stricts — 1) analyse/interpretation
  // (constat general + lecture de CHAQUE axe, rien de prescriptif), 2)
  // recommandations/plan d'action, qui decoule logiquement du bloc 1. Les
  // diagnostics generes avant l'introduction de ce format
  // (recommandations_v2 absent) retombent sur l'ancien bloc de texte
  // unique, inchange.
  const structure = diag.recommandations_v2

  if (structure) {
    // ══════════════════════════════════════════
    // BLOC 1 : ANALYSE, INTERPRETATION ET CONSTAT GENERAL
    // ══════════════════════════════════════════
    pageBreakIfNeeded(50)
    sectionTitle('ANALYSE, INTERPRÉTATION ET CONSTAT GÉNÉRAL')
    paragraphe(structure.constatGeneral, { fontSize: 8.5, fond: true })

    cles.forEach(cle => {
      const texteAxe = structure.analyseParAxe?.[cle]
      if (!texteAxe) return
      pageBreakIfNeeded(28)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...NAVY)
      doc.text(AXES_LABELS[cle], M, y)
      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      const wrapped = doc.splitTextToSize(texteAxe, contentW)
      const blocH = wrapped.length * 11
      pageBreakIfNeeded(blocH + 10)
      doc.text(wrapped, M, y)
      y += blocH + 12
    })
    y += 4

    // ══════════════════════════════════════════
    // BLOC 2 : RECOMMANDATIONS ET PLAN D'ACTION
    // ══════════════════════════════════════════
    pageBreakIfNeeded(50)
    sectionTitle("RECOMMANDATIONS ET PLAN D'ACTION")
    paragraphe(structure.recommandations, { fontSize: 8.5, fond: true })
  } else {
    // ══════════════════════════════════════════
    // RECOMMANDATIONS (format legacy)
    // ══════════════════════════════════════════
    pageBreakIfNeeded(50)
    sectionTitle('RECOMMANDATIONS PERSONNALISÉES')
    const texteRecos = diag.recommandations || "Recommandations non générées pour ce diagnostic. Rendez-vous sur la page en ligne pour les générer."
    paragraphe(texteRecos, { fontSize: 8.5, fond: true, italique: !diag.recommandations, couleur: diag.recommandations ? DARK : GRAY })
  }

  // ══════════════════════════════════════════
  // NOTE METHODOLOGIQUE
  // ══════════════════════════════════════════
  pageBreakIfNeeded(26)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  doc.text('NOTE MÉTHODOLOGIQUE', M, y)
  y += 9
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  doc.text(
    "Ce diagnostic est une auto-évaluation déclarative réalisée par le participant, sur 10 axes normés notés de 0 à 5 selon des critères vérifiables. Il ne constitue pas un audit certifié.",
    M, y, { maxWidth: contentW },
  )

  drawFooter()

  // Numerotation des pages — ajoutee en tout dernier, une fois le nombre
  // total de pages connu (jsPDF ne l'expose qu'apres coup).
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text(`Page ${p} / ${totalPages}`, W / 2, H - 22, { align: 'center' })
  }

  if (download) {
    const nomFichier = (diag.organisation || `${diag.prenom}-${diag.nom}` || 'diagnostic').replace(/[^a-zA-Z0-9]+/g, '-')
    doc.save(`COPAF2026-Diagnostic-${nomFichier}.pdf`)
    return null
  }
  return doc
}