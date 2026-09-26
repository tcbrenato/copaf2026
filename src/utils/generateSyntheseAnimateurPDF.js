// src/utils/generateSyntheseAnimateurPDF.js
//
// Genere la synthese animateur du Diagnostic Smart Port COPAF 2026 : un
// recapitulatif agrege (jamais de donnee individuelle nominative) pense
// pour nourrir directement la redaction du Livre Blanc ou des resolutions
// de la conference. Meme logique de dessin vectoriel que
// generateDiagnosticPDF.js (pas de capture d'ecran, rendu net a toute
// resolution).

import jsPDF from 'jspdf'

const NAVY     = [0, 14, 145]     // #000E91
const BLUE     = [0, 115, 244]    // #0073F4
const GRAY     = [100, 116, 139]
const DARK     = [15, 23, 42]
const LIGHT_BG = [248, 250, 252]
const LINE     = [226, 232, 240]
const GREEN    = [22, 163, 74]
const GOLD     = [217, 119, 6]
const RED      = [220, 38, 38]

function fmtDateLong(d = new Date()) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function couleurNiveau(v) {
  if (v < 2) return RED
  if (v < 3.5) return GOLD
  return GREEN
}

function pointsPolygone(cx, cy, rayon, n, valeurs = null, maxVal = 5) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    const r = valeurs ? (valeurs[i] / maxVal) * rayon : rayon
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
  }
  return pts
}

// `moyennesParAxe` : [{ key, label, moyenne, n }, ...] (memes objets que
// ceux deja calcules dans AdminDiagnostics.jsx — aucune donnee individuelle
// n'entre dans ce document, uniquement des moyennes agregees).
export function generateSyntheseAnimateurPDF({ moyennesParAxe, nbDiagnostics, scoreGlobalMoyen, paysStats, filtrePays }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 44
  const contentW = W - M * 2
  let y = 0

  const drawFooter = () => {
    const footerY = H - 46
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(M, footerY, W - M, footerY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text('COPAF 2026 - Synthèse Diagnostic Smart Port', M, footerY + 14)
    doc.text('contact@copaf-ports.com', M, footerY + 24)
    doc.text('www.copaf-ports.com', W - M, footerY + 14, { align: 'right' })
  }

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

  // ══════════════════════════════════════════
  // EN-TETE
  // ══════════════════════════════════════════
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text('COPAF 2026 · DIAGNOSTIC SMART PORT', M, M)

  const badgeW = 130
  const badgeH = 40
  doc.setFillColor(...NAVY)
  doc.roundedRect(W - M - badgeW, M - 26, badgeW, badgeH, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(200, 210, 255)
  doc.text('SCORE MOYEN GLOBAL', W - M - badgeW / 2, M - 12, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text(`${scoreGlobalMoyen.toFixed(1)} / 5`, W - M - badgeW / 2, M + 6, { align: 'center' })

  y = M + 8
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1.25)
  doc.line(M, y, W - M, y)
  y += 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.text('Synthèse - Diagnostic Smart Port', M, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  doc.text(
    `${filtrePays ? `Périmètre : ${filtrePays}` : 'Tous pays confondus'}  ·  ${nbDiagnostics} diagnostic${nbDiagnostics > 1 ? 's' : ''} agrégé${nbDiagnostics > 1 ? 's' : ''}  ·  ${fmtDateLong()}`,
    M, y,
  )
  y += 8
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...GRAY)
  doc.text("Document agrégé - aucune donnée individuelle ou nominative ne figure dans ce rapport.", M, y)
  y += 24

  // ══════════════════════════════════════════
  // RADAR GLOBAL
  // ══════════════════════════════════════════
  const axesRenseignes = moyennesParAxe.filter(a => a.n > 0)
  if (axesRenseignes.length > 0) {
    const radarBoxH = 240
    doc.setFillColor(...LIGHT_BG)
    doc.roundedRect(M, y, contentW, radarBoxH, 8, 8, 'F')

    const cx = M + contentW / 2
    const cy = y + radarBoxH / 2 + 4
    const rayon = 92
    const n = moyennesParAxe.length
    const valeurs = moyennesParAxe.map(a => a.moyenne)

    for (let niveau = 1; niveau <= 5; niveau++) {
      const pts = pointsPolygone(cx, cy, (rayon * niveau) / 5, n)
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.5)
      for (let i = 0; i < n; i++) {
        const next = pts[(i + 1) % n]
        doc.line(pts[i][0], pts[i][1], next[0], next[1])
      }
    }
    const spokePts = pointsPolygone(cx, cy, rayon, n)
    spokePts.forEach(p => {
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.5)
      doc.line(cx, cy, p[0], p[1])
    })

    const dataPts = pointsPolygone(cx, cy, rayon, n, valeurs, 5)
    doc.setFillColor(...BLUE)
    doc.setDrawColor(...NAVY)
    doc.setLineWidth(1.5)
    doc.lines(
      dataPts.slice(1).map((p, i) => [p[0] - dataPts[i][0], p[1] - dataPts[i][1]]),
      dataPts[0][0], dataPts[0][1],
      [1, 1], 'FD', true,
    )
    dataPts.forEach(p => {
      doc.setFillColor(...NAVY)
      doc.circle(p[0], p[1], 2, 'F')
    })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...DARK)
    spokePts.forEach((p, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
      const lx = cx + (rayon + 20) * Math.cos(angle)
      const ly = cy + (rayon + 20) * Math.sin(angle)
      const align = Math.cos(angle) > 0.15 ? 'left' : Math.cos(angle) < -0.15 ? 'right' : 'center'
      const lines = doc.splitTextToSize(moyennesParAxe[i].label, 78)
      doc.text(lines, lx, ly, { align })
    })

    y += radarBoxH + 20
  }

  // ══════════════════════════════════════════
  // DETAIL PAR AXE (2 colonnes)
  // ══════════════════════════════════════════
  sectionTitle('MOYENNE PAR AXE')

  const colGap = 24
  const colW = (contentW - colGap) / 2
  const rowH = 34
  moyennesParAxe.forEach((axe, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = M + col * (colW + colGap)
    const rowY = y + row * rowH

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text(axe.label, x, rowY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...couleurNiveau(axe.moyenne))
    doc.text(`${axe.moyenne.toFixed(1)}/5 · ${axe.n} réponse${axe.n > 1 ? 's' : ''}`, x + colW, rowY, { align: 'right' })

    const barY = rowY + 5
    doc.setFillColor(...LINE)
    doc.roundedRect(x, barY, colW, 5, 2.5, 2.5, 'F')
    doc.setFillColor(...couleurNiveau(axe.moyenne))
    doc.roundedRect(x, barY, Math.max(6, (colW * axe.moyenne) / 5), 5, 2.5, 2.5, 'F')
  })
  y += Math.ceil(moyennesParAxe.length / 2) * rowH + 14

  // ══════════════════════════════════════════
  // POINTS FORTS / AXES PRIORITAIRES
  // ══════════════════════════════════════════
  if (axesRenseignes.length >= 2) {
    pageBreakIfNeeded(120)
    sectionTitle('POINTS FORTS & AXES PRIORITAIRES')
    const tries = [...axesRenseignes].sort((a, b) => b.moyenne - a.moyenne)
    const forts = tries.slice(0, 3)
    const faibles = tries.slice(-3).reverse()

    const listeY0 = y
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...GREEN)
    doc.text('▲ POINTS FORTS', M, y)
    let yy = y + 16
    forts.forEach(a => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      doc.text(a.label, M, yy)
      doc.setTextColor(...GREEN)
      doc.text(`${a.moyenne.toFixed(1)}`, M + colW, yy, { align: 'right' })
      yy += 15
    })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...RED)
    doc.text('▼ AXES PRIORITAIRES', M + colW + colGap, listeY0)
    let yy2 = listeY0 + 16
    faibles.forEach(a => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      doc.text(a.label, M + colW + colGap, yy2)
      doc.setTextColor(...RED)
      doc.text(`${a.moyenne.toFixed(1)}`, W - M, yy2, { align: 'right' })
      yy2 += 15
    })

    y = Math.max(yy, yy2) + 14
  }

  // ══════════════════════════════════════════
  // REPARTITION PAR PAYS
  // ══════════════════════════════════════════
  if (paysStats && paysStats.length > 0) {
    pageBreakIfNeeded(40)
    sectionTitle('RÉPARTITION PAR PAYS')
    paysStats.forEach(p => {
      pageBreakIfNeeded(18)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      doc.text(p.pays, M, y)
      doc.setTextColor(...GRAY)
      doc.text(`${p.n} diagnostic${p.n > 1 ? 's' : ''}`, M + contentW - 140, y, { align: 'right' })
      doc.setTextColor(...couleurNiveau(p.moyenne))
      doc.setFont('helvetica', 'bold')
      doc.text(`${p.moyenne.toFixed(1)}/5`, W - M, y, { align: 'right' })
      y += 15
    })
    y += 10
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
    "Synthèse calculée à partir d'auto-évaluations déclaratives, sur 10 axes normés notés de 0 à 5 selon des critères vérifiables. Ne constitue pas un audit certifié.",
    M, y, { maxWidth: contentW },
  )

  drawFooter()

  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...GRAY)
    doc.text(`Page ${p} / ${totalPages}`, W / 2, H - 22, { align: 'center' })
  }

  const suffixe = filtrePays ? filtrePays.replace(/[^a-zA-Z0-9]+/g, '-') : 'tous-pays'
  doc.save(`COPAF2026-Synthese-Diagnostic-${suffixe}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
