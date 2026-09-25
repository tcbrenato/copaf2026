// src/utils/paysDrapeaux.js
//
// Drapeau (emoji) et logo de port/autorite portuaire, pour la carte publique du QR code
// (BadgeToken.jsx). `value` correspond exactement aux valeurs du selecteur PAYS d'Inscription.jsx —
// ne pas renommer les cles, seulement en ajouter si la liste des pays evolue.

const ISO_PAR_PAYS = {
  Maroc: 'MA', Benin: 'BJ', Togo: 'TG', "Cote d'Ivoire": 'CI', Senegal: 'SN', Guinee: 'GN',
  'Guinee-Bissau': 'GW', 'Guinee Equatoriale': 'GQ', Mauritanie: 'MR', Mali: 'ML', 'Burkina Faso': 'BF',
  Niger: 'NE', Nigeria: 'NG', Ghana: 'GH', Gambie: 'GM', 'Sierra Leone': 'SL', Liberia: 'LR',
  Cameroun: 'CM', Gabon: 'GA', Congo: 'CG', RDC: 'CD', 'Sao Tome-et-Principe': 'ST', Tchad: 'TD',
  'Republique Centrafricaine': 'CF', Angola: 'AO', 'Cap-Vert': 'CV', 'Afrique du Sud': 'ZA',
  Namibie: 'NA', Mozambique: 'MZ', Madagascar: 'MG', Comores: 'KM', Seychelles: 'SC', Maurice: 'MU',
  Algerie: 'DZ', Tunisie: 'TN', Libye: 'LY', Egypte: 'EG', Kenya: 'KE', Tanzanie: 'TZ',
  Djibouti: 'DJ', Soudan: 'SD', Somalie: 'SO', Erythree: 'ER', Ethiopie: 'ET', Rwanda: 'RW',
  Ouganda: 'UG', 'Emirats Arabes Unis': 'AE', 'Arabie Saoudite': 'SA', Turquie: 'TR', Chine: 'CN',
  Inde: 'IN', France: 'FR', Belgique: 'BE', Allemagne: 'DE', 'Pays-Bas': 'NL', Espagne: 'ES',
  Portugal: 'PT', Italie: 'IT', 'Royaume-Uni': 'GB', 'Etats-Unis': 'US', Canada: 'CA', Bresil: 'BR',
}

// Emoji drapeau = deux "regional indicator symbols" (lettres majuscules -> U+1F1E6.. via offset).
export function drapeauEmoji(pays) {
  const iso = ISO_PAR_PAYS[String(pays || '').trim()]
  if (!iso) return ''
  return [...iso].map(l => String.fromCodePoint(127397 + l.charCodeAt(0))).join('')
}

// Logo de l'autorite portuaire : seulement quand on en a un en stock (public/), sinon omis
// silencieusement sur la carte ("si possible" — pas un logo par port, juste ceux disponibles).
const LOGOS_PORT = [
  { motif: /nigerian ports/i, src: '/npalogo.png' },
]
export function logoPort(organisation) {
  const o = String(organisation || '')
  return LOGOS_PORT.find(l => l.motif.test(o))?.src || null
}
