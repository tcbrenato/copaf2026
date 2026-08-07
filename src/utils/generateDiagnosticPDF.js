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
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('DÉTAIL PAR AXE', M, y)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.line(M, y + 5, W - M, y + 5)
  y += 20

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

  // ══════════════════════════════════════════
  // RECOMMANDATIONS
  // ══════════════════════════════════════════
  if (y > H - 160) { drawFooter(); doc.addPage(); y = M }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('RECOMMANDATIONS PERSONNALISÉES', M, y)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(0.75)
  doc.line(M, y + 5, W - M, y + 5)
  y += 16

  const texteRecos = diag.recommandations || "Recommandations non générées pour ce diagnostic. Rendez-vous sur la page en ligne pour les générer."
  doc.setFont('helvetica', diag.recommandations ? 'normal' : 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(...(diag.recommandations ? DARK : GRAY))
  const recoWrapped = doc.splitTextToSize(texteRecos, contentW)
  const recoH = recoWrapped.length * 11 + 20

  if (y + recoH > H - 70) { drawFooter(); doc.addPage(); y = M }

  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(M, y, contentW, recoH, 8, 8, 'F')
  doc.text(recoWrapped, M + 14, y + 16)
  y += recoH + 16

  // ══════════════════════════════════════════
  // MENTION
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY)
  doc.text("Ce diagnostic est une auto-évaluation déclarative réalisée par le participant. Il ne constitue pas un audit certifié.", M, y)

  drawFooter()

  if (download) {
    const nomFichier = (diag.organisation || `${diag.prenom}-${diag.nom}` || 'diagnostic').replace(/[^a-zA-Z0-9]+/g, '-')
    doc.save(`COPAF2026-Diagnostic-${nomFichier}.pdf`)
    return null
  }
  return doc
}