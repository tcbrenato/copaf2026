// Ordre logique du parcours terrain : accueil -> hotel -> kit puis tablette (numero) -> presence J1 -> retour.
// Partage entre Terrain.jsx et StaffScan.jsx.
// souple : on peut passer outre apres confirmation (ex. personne non accueillie a l'aeroport).
export const PREREQUIS = {
  hotel: { avant: 'aeroport', souple: true },
  badge: { avant: 'hotel' },
  tablette: { avant: 'badge' },
}

export const NB_TABLETTES = 35
export const NUMEROS_TABLETTES = Array.from({ length: NB_TABLETTES }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
export const normaliserNumeroTablette = v => String(v || '').replace(/\s+/g, '').toUpperCase()
