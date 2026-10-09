// Petites fonctions manquantes aux navigateurs anciens (tablettes Android 8.1 / Chrome 69).
// Chaque ajout est conditionnel : rien n'est modifié sur un navigateur récent.

if (!Object.fromEntries) {
  Object.fromEntries = function fromEntries(entrees) {
    const objet = {}
    for (const [cle, valeur] of entrees) objet[cle] = valeur
    return objet
  }
}

if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', {
    configurable: true,
    writable: true,
    value: function at(index) {
      const i = Math.trunc(index) || 0
      const k = i < 0 ? this.length + i : i
      return k < 0 || k >= this.length ? undefined : this[k]
    },
  })
}

if (!String.prototype.replaceAll) {
  Object.defineProperty(String.prototype, 'replaceAll', {
    configurable: true,
    writable: true,
    value: function replaceAll(motif, remplacement) {
      if (motif instanceof RegExp) return this.replace(motif, remplacement)
      return this.split(String(motif)).join(remplacement)
    },
  })
}

if (!Promise.allSettled) {
  Promise.allSettled = function allSettled(promesses) {
    return Promise.all(Array.from(promesses, p =>
      Promise.resolve(p).then(
        value => ({ status: 'fulfilled', value }),
        reason => ({ status: 'rejected', reason }),
      )))
  }
}

// Identifiant aléatoire sûr (crypto.getRandomValues) quand crypto.randomUUID n'existe pas
if (typeof crypto !== 'undefined' && !crypto.randomUUID && crypto.getRandomValues) {
  crypto.randomUUID = function randomUUID() {
    const o = crypto.getRandomValues(new Uint8Array(16))
    o[6] = (o[6] & 0x0f) | 0x40
    o[8] = (o[8] & 0x3f) | 0x80
    const h = Array.from(o, b => b.toString(16).padStart(2, '0')).join('')
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
  }
}
