// Fonctions et constantes partagées par les composants de l'espace traducteurs.

// Texte dans la langue demandée ('fr' | 'en'), avec repli sur l'autre langue si elle est vide
export const dans = (objet, base, lang) => {
  const autre = lang === 'en' ? 'fr' : 'en'
  return (objet && (objet[`${base}_${lang}`] || objet[`${base}_${autre}`])) || ''
}

export const CATEGORIES_DOC = ['programme', 'carnet', 'intervenants', 'presentations', 'glossaire', 'plan', 'note', 'magazine']
