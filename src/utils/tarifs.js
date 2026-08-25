// src/utils/tarifs.js
//
// Logique centralisee du tarif preferentiel ANP/UAPNA.
//
// Deux façons independantes de qualifier un participant pour le tarif
// preferentiel (logique OU) :
//   1. Son pays fait partie de la liste UAPNA/ANP (detection automatique,
//      invisible sur le site).
//   2. Il saisit un code partenaire valide (COPAF-ANP / COPAF-UAPNA),
//      communique directement par nous / l'ANP / l'UAPNA a leurs contacts.
//      Sert aussi de tracabilite : on sait quel canal a genere l'inscription.
//
// Le tarif preferentiel n'est JAMAIS affiche dans l'interface du formulaire
// (voir Inscription.jsx : le recap visible reste toujours au tarif standard).
// Il n'apparait que dans les documents generes (email, PDF recap, proforma),
// qui sont prives et propres a chaque participant.

export const PRIX_STANDARD = 3500

// ⚠️ Montant PROVISOIRE (2500€, consigne DG du 25/08/2026) en attendant le
// retour officiel de l'ANP/UAPNA. Une fois confirme, changer uniquement
// cette valeur — tout le reste du systeme (formulaire, emails, PDF) se met
// a jour automatiquement.
export const PRIX_PREFERENTIEL = 2500

// Pays membres de l'UAPNA (Union des Administrations Portuaires du Nord de
// l'Afrique), dont l'ANP (Maroc) est l'hote de la COPAF 2026. Values alignees
// sur celles du tableau PAYS dans Inscription.jsx — ne pas modifier sans
// verifier la correspondance.
export const PAYS_UAPNA_ANP = [
  'Maroc',
  'Mauritanie',
  'Algerie',
  'Tunisie',
  'Libye',
  'Egypte',
  'Soudan',
]

// Codes partenaires donnant droit au tarif preferentiel independamment du
// pays saisi. Jamais affiches sur le site — communiques de la main a la main.
// Comparaison insensible a la casse et aux espaces superflus.
export const CODES_PROMO_PREFERENTIELS = ['COPAF-ANP', 'COPAF-UAPNA']

export function estPaysUapnaAnp(pays) {
  return PAYS_UAPNA_ANP.includes(pays)
}

export function estCodePreferentiel(code) {
  if (!code) return false
  return CODES_PROMO_PREFERENTIELS.includes(code.trim().toUpperCase())
}

/**
 * Calcule le tarif reel applicable a un participant.
 *
 * @param {string} pays - value du pays selectionne (ex. 'Maroc')
 * @param {string} code - code partenaire saisi (facultatif)
 * @returns {{
 *   prixUnitaire: number,
 *   estPreferentiel: boolean,
 *   source: 'pays' | 'code' | null,
 *   codeUtilise: string,
 * }}
 */
export function calculerTarif(pays, code) {
  const parCode = estCodePreferentiel(code)
  const parPays = estPaysUapnaAnp(pays)
  const estPreferentiel = parCode || parPays

  return {
    prixUnitaire: estPreferentiel ? PRIX_PREFERENTIEL : PRIX_STANDARD,
    estPreferentiel,
    // Le code prime dans l'affichage de la source si les deux sont vrais,
    // car c'est l'info la plus precise pour la tracabilite du canal.
    source: parCode ? 'code' : (parPays ? 'pays' : null),
    codeUtilise: parCode ? code.trim().toUpperCase() : '',
  }
}