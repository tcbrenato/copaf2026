// src/data/diagnosticCountries.js
//
// Correspondance pays -> code ISO numerique (id des geometries dans
// world-atlas/countries-50m.json, meme logique que agpaocUapnaCountries.js)
// pour tous les pays couverts par le Diagnostic Smart Port (les 3 reseaux
// regionaux + membres associes), utilisee par la carte live du mode
// Projection (src/pages/ProjectionDiagnostic.jsx).
//
// Cle = valeur exacte du champ `country` dans diagnosticOrganisations.js
// (texte libre francais, sans accents pour la plupart) : ne pas renommer
// ces cles sans mettre a jour ORGANISATIONS en parallele.
//
// `center` = coordonnees approximatives [longitude, latitude] utilisees
// pour positionner le point de signal en direct sur la carte — precision
// suffisante pour un repere visuel a l'echelle du continent, pas une
// geolocalisation exacte du port.

export const COUNTRY_ISO_BY_NAME = {
  // ── AGPAOC / PMAWCA ──
  'Mauritanie':              { isoNumeric: '478', center: [-10.9, 20.2], network: 'agpaoc' },
  'Senegal':                 { isoNumeric: '686', center: [-14.5, 14.5], network: 'agpaoc' },
  'Gambie':                  { isoNumeric: '270', center: [-15.3, 13.5], network: 'agpaoc' },
  'Guinee-Bissau':           { isoNumeric: '624', center: [-15.2, 12.0], network: 'agpaoc' },
  'Guinee':                  { isoNumeric: '324', center: [-10.8, 10.4], network: 'agpaoc' },
  'Sierra Leone':            { isoNumeric: '694', center: [-11.8, 8.6], network: 'agpaoc' },
  'Liberia':                 { isoNumeric: '430', center: [-9.4, 6.4], network: 'agpaoc' },
  "Cote d'Ivoire":           { isoNumeric: '384', center: [-5.5, 7.5], network: 'agpaoc' },
  'Ghana':                   { isoNumeric: '288', center: [-1.0, 7.9], network: 'agpaoc' },
  'Togo':                    { isoNumeric: '768', center: [1.2, 8.6], network: 'agpaoc' },
  'Benin':                   { isoNumeric: '204', center: [2.3, 9.3], network: 'agpaoc' },
  'Nigeria':                 { isoNumeric: '566', center: [8.0, 9.1], network: 'agpaoc' },
  'Cameroun':                { isoNumeric: '120', center: [12.7, 5.7], network: 'agpaoc' },
  'Guinee Equatoriale':      { isoNumeric: '226', center: [10.3, 1.6], network: 'agpaoc' },
  'Gabon':                   { isoNumeric: '266', center: [11.6, -0.8], network: 'agpaoc' },
  'Congo':                   { isoNumeric: '178', center: [15.2, -0.7], network: 'agpaoc' },
  'RDC':                     { isoNumeric: '180', center: [21.8, -4.0], network: 'agpaoc' },
  'Angola':                  { isoNumeric: '024', center: [17.9, -12.3], network: 'agpaoc' },
  'Cap-Vert':                { isoNumeric: '132', center: [-24.0, 16.0], network: 'agpaoc' },

  // ── PMAESA ──
  'Kenya':                   { isoNumeric: '404', center: [37.9, 0.0], network: 'pmaesa' },
  'Tanzanie':                { isoNumeric: '834', center: [34.9, -6.4], network: 'pmaesa' },
  'Ouganda':                 { isoNumeric: '800', center: [32.3, 1.4], network: 'pmaesa' },
  'Mozambique':              { isoNumeric: '508', center: [35.5, -18.7], network: 'pmaesa' },
  'Afrique du Sud':          { isoNumeric: '710', center: [24.7, -29.0], network: 'pmaesa' },
  'Namibie':                 { isoNumeric: '516', center: [17.1, -22.6], network: 'pmaesa' },
  'Djibouti':                { isoNumeric: '262', center: [42.6, 11.7], network: 'pmaesa' },
  'Soudan':                  { isoNumeric: '729', center: [30.2, 15.5], network: 'pmaesa' },
  'Maurice':                 { isoNumeric: '480', center: [57.6, -20.3], network: 'pmaesa' },
  'Somalie':                 { isoNumeric: '706', center: [46.2, 5.2], network: 'pmaesa' },
  'Erythree':                { isoNumeric: '232', center: [39.8, 15.2], network: 'pmaesa' },
  'Comores':                 { isoNumeric: '174', center: [43.9, -11.9], network: 'pmaesa' },
  'Madagascar':              { isoNumeric: '450', center: [46.9, -18.9], network: 'pmaesa' },
  'Seychelles':              { isoNumeric: '690', center: [55.6, -4.6], network: 'pmaesa' },

  // ── UAPNA ──
  'Maroc':                   { isoNumeric: '504', center: [-6.5, 31.8], network: 'uapna' },
  'Algerie':                 { isoNumeric: '012', center: [2.6, 28.2], network: 'uapna' },
  'Tunisie':                 { isoNumeric: '788', center: [9.5, 34.0], network: 'uapna' },
  'Libye':                   { isoNumeric: '434', center: [17.2, 26.3], network: 'uapna' },
  'Egypte':                  { isoNumeric: '818', center: [30.8, 26.8], network: 'uapna' },

  // ── Membres associes (pays enclaves) ──
  'Mali':                    { isoNumeric: '466', center: [-3.0, 17.6], network: 'associe' },
  'Burkina Faso':            { isoNumeric: '854', center: [-1.6, 12.2], network: 'associe' },
  'Niger':                   { isoNumeric: '562', center: [8.1, 17.6], network: 'associe' },
  'Tchad':                   { isoNumeric: '148', center: [18.7, 15.5], network: 'associe' },
  'Republique Centrafricaine': { isoNumeric: '140', center: [20.9, 6.6], network: 'associe' },
}

// Palette par reseau — distincte de GROUP_COLORS (agpaocUapnaCountries.js,
// qui ne couvre que AGPAOC/UAPNA/DUAL) car le diagnostic couvre 4 groupes.
export const RESEAU_COLORS = {
  agpaoc: '#0073F4',
  pmaesa: '#22c55e',
  uapna: '#f59e0b',
  associe: '#a78bfa',
}

export const NEUTRAL_COUNTRY_COLOR = '#1e293b'
