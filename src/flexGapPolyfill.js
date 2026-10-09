// Espacement « gap » des conteneurs flex pour les navigateurs anciens (Chrome < 84).
// Ces navigateurs lisent la valeur de `gap` mais ne l'appliquent qu'aux grilles : on la convertit en marges sur les enfants.
// Actif seulement en mode allégé (classe « lite » sur <html>, voir polyfills.js). Idempotent : réappliqué si le contenu change.

const px = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }

function appliquer(conteneur) {
  const cs = getComputedStyle(conteneur)
  if (cs.display !== 'flex' && cs.display !== 'inline-flex') return
  const cg = px(cs.columnGap)
  const rg = px(cs.rowGap)
  if (!cg && !rg) return

  const colonne = cs.flexDirection.indexOf('column') === 0
  const inverse = cs.flexDirection.indexOf('reverse') !== -1
  const retour = cs.flexWrap !== 'nowrap'
  const enfants = Array.prototype.filter.call(conteneur.children, e => e.nodeType === 1 && getComputedStyle(e).display !== 'none')

  enfants.forEach((enfant, i) => {
    if (enfant.__m0 === undefined) {
      const c = getComputedStyle(enfant)
      enfant.__m0 = { l: px(c.marginLeft), r: px(c.marginRight), t: px(c.marginTop), b: px(c.marginBottom) }
    }
    const m = enfant.__m0
    let l = m.l, r = m.r, t = m.t, b = m.b
    if (retour) {
      // lignes multiples : marge après chaque élément, compensée par une marge négative sur le conteneur
      if (!colonne) { if (inverse) l += cg; else r += cg; b += rg } else { b += rg; r += cg }
    } else if (i > 0) {
      if (colonne) { if (inverse) b += rg; else t += rg } else if (inverse) r += cg; else l += cg
    }
    enfant.style.marginLeft = l + 'px'
    enfant.style.marginRight = r + 'px'
    enfant.style.marginTop = t + 'px'
    enfant.style.marginBottom = b + 'px'
  })

  if (retour) {
    if (conteneur.__m0 === undefined) {
      conteneur.__m0 = { l: px(cs.marginLeft), r: px(cs.marginRight), t: px(cs.marginTop), b: px(cs.marginBottom) }
    }
    const m = conteneur.__m0
    if (inverse && !colonne) conteneur.style.marginLeft = (m.l - cg) + 'px'
    else conteneur.style.marginRight = (m.r - cg) + 'px'
    conteneur.style.marginBottom = (m.b - rg) + 'px'
  }
}

// Test classique : deux enfants de 0 px séparés par un gap de 1 px dans un flex en colonne
function flexGapSupporte() {
  const parent = document.body || document.documentElement
  const d = document.createElement('div')
  d.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden;left:-99px'
  d.appendChild(document.createElement('div'))
  d.appendChild(document.createElement('div'))
  parent.appendChild(d)
  const ok = d.scrollHeight === 1
  parent.removeChild(d)
  return ok
}

export function installerFlexGap() {
  if (flexGapSupporte()) return
  const sales = new Set()
  let minuteur = null

  const traiter = () => {
    minuteur = null
    const racines = Array.from(sales)
    sales.clear()
    racines.forEach(racine => {
      if (!racine.isConnected) return
      appliquer(racine)
      const tous = racine.querySelectorAll('*')
      for (let i = 0; i < tous.length; i++) appliquer(tous[i])
      if (racine.parentElement) appliquer(racine.parentElement)
    })
  }
  const planifier = racine => {
    sales.add(racine)
    if (!minuteur) minuteur = setTimeout(traiter, 60)
  }

  new MutationObserver(mutations => {
    mutations.forEach(mu => {
      if (mu.type === 'childList') {
        mu.addedNodes.forEach(n => { if (n.nodeType === 1) planifier(n) })
        if (mu.target.nodeType === 1) planifier(mu.target)
      }
    })
  }).observe(document.documentElement, { childList: true, subtree: true })

  planifier(document.body || document.documentElement)
  window.addEventListener('load', () => planifier(document.body))
  window.addEventListener('resize', () => planifier(document.body))
}
