// src/data/agpaocUapnaCountries.js
//
// Pays membres AGPAOC (Afrique de l'Ouest et du Centre) et UAPNA
// (Afrique du Nord), pour la carte interactive MapAgpaocUapna.
//
// `isoNumeric` = code ISO 3166-1 NUMERIQUE (pas alpha-3) : c'est ce que
// world-atlas/countries-*.json utilise comme `id` de geometrie topojson —
// react-simple-maps matche donc les pays sur ce code, pas sur `iso3`.
// `iso3` est garde pour reference/affichage eventuel, mais n'est jamais
// utilise pour le matching cartographique.
//
// Resolution choisie : countries-50m.json (pas 110m) car le Cap-Vert et
// Sao Tome-et-Principe — deux vrais membres AGPAOC — sont absents du
// topojson 110m (îles trop petites pour cette simplification). Le 50m
// reste raisonnable a charger (~150 Ko gzippe) et les inclut tous les deux.

export const AGPAOC_UAPNA_COUNTRIES = [
  // --- AGPAOC (Afrique de l'Ouest et du Centre) ---
  { iso3: 'AGO', isoNumeric: '024', name_fr: 'Angola', name_en: 'Angola', group: 'AGPAOC', ports: 'Porto de Luanda (EPL) — Luanda, Lobito, Namibe', timezone: 'Africa/Luanda' },
  { iso3: 'BEN', isoNumeric: '204', name_fr: 'Bénin', name_en: 'Benin', group: 'AGPAOC', ports: 'Port Autonome de Cotonou (PAC)', timezone: 'Africa/Porto-Novo' },
  { iso3: 'CPV', isoNumeric: '132', name_fr: 'Cap-Vert', name_en: 'Cape Verde', group: 'AGPAOC', ports: 'Enapor — Praia, Mindelo', timezone: 'Atlantic/Cape_Verde' },
  { iso3: 'CMR', isoNumeric: '120', name_fr: 'Cameroun', name_en: 'Cameroon', group: 'AGPAOC', ports: 'Port Autonome de Douala-Bonabéri / Port de Kribi', timezone: 'Africa/Douala' },
  { iso3: 'COG', isoNumeric: '178', name_fr: 'Congo (Brazzaville)', name_en: 'Congo (Brazzaville)', group: 'AGPAOC', ports: 'Port Autonome de Pointe-Noire', timezone: 'Africa/Brazzaville' },
  { iso3: 'CIV', isoNumeric: '384', name_fr: "Côte d'Ivoire", name_en: 'Ivory Coast', group: 'AGPAOC', ports: "Port Autonome d'Abidjan (PAA) / Port de San-Pédro", timezone: 'Africa/Abidjan' },
  { iso3: 'GAB', isoNumeric: '266', name_fr: 'Gabon', name_en: 'Gabon', group: 'AGPAOC', ports: 'OPRAG — Owendo, Port-Gentil', timezone: 'Africa/Libreville' },
  { iso3: 'GMB', isoNumeric: '270', name_fr: 'Gambie', name_en: 'Gambia', group: 'AGPAOC', ports: 'Gambia Ports Authority (GPA) — Banjul', timezone: 'Africa/Banjul' },
  { iso3: 'GHA', isoNumeric: '288', name_fr: 'Ghana', name_en: 'Ghana', group: 'AGPAOC', ports: 'Ghana Ports and Harbours Authority (GPHA) — Tema, Takoradi', timezone: 'Africa/Accra' },
  { iso3: 'GIN', isoNumeric: '324', name_fr: 'Guinée', name_en: 'Guinea', group: 'AGPAOC', ports: 'Port Autonome de Conakry (PAC)', timezone: 'Africa/Conakry' },
  { iso3: 'GNB', isoNumeric: '624', name_fr: 'Guinée-Bissau', name_en: 'Guinea-Bissau', group: 'AGPAOC', ports: 'Administração dos Portos da Guiné-Bissau — Bissau', timezone: 'Africa/Bissau' },
  { iso3: 'GNQ', isoNumeric: '226', name_fr: 'Guinée Équatoriale', name_en: 'Equatorial Guinea', group: 'AGPAOC', ports: 'Autorité portuaire nationale — Malabo, Bata', timezone: 'Africa/Malabo' },
  { iso3: 'LBR', isoNumeric: '430', name_fr: 'Liberia', name_en: 'Liberia', group: 'AGPAOC', ports: 'National Port Authority (NPA) — Monrovia', timezone: 'Africa/Monrovia' },
  { iso3: 'NGA', isoNumeric: '566', name_fr: 'Nigeria', name_en: 'Nigeria', group: 'AGPAOC', ports: 'Nigerian Ports Authority (NPA) — Lagos, Port Harcourt, Onne, Calabar', timezone: 'Africa/Lagos' },
  { iso3: 'COD', isoNumeric: '180', name_fr: 'RD Congo', name_en: 'DR Congo', group: 'AGPAOC', ports: 'Régie des Voies Fluviales / Port de Matadi', timezone: 'Africa/Kinshasa' },
  { iso3: 'STP', isoNumeric: '678', name_fr: 'Sao Tomé-et-Principe', name_en: 'Sao Tome and Principe', group: 'AGPAOC', ports: 'Enaport — São Tomé', timezone: 'Africa/Sao_Tome' },
  { iso3: 'SEN', isoNumeric: '686', name_fr: 'Sénégal', name_en: 'Senegal', group: 'AGPAOC', ports: 'Port Autonome de Dakar (PAD)', timezone: 'Africa/Dakar' },
  { iso3: 'SLE', isoNumeric: '694', name_fr: 'Sierra Leone', name_en: 'Sierra Leone', group: 'AGPAOC', ports: 'Sierra Leone Ports Authority (SLPA) — Freetown', timezone: 'Africa/Freetown' },
  { iso3: 'TGO', isoNumeric: '768', name_fr: 'Togo', name_en: 'Togo', group: 'AGPAOC', ports: 'Port Autonome de Lomé (PAL)', timezone: 'Africa/Lome' },

  // --- Mauritanie : double appartenance ---
  { iso3: 'MRT', isoNumeric: '478', name_fr: 'Mauritanie', name_en: 'Mauritania', group: 'DUAL', ports: 'Port Autonome de Nouakchott (PAN) / Port de Nouadhibou', timezone: 'Africa/Nouakchott' },

  // --- UAPNA (Afrique du Nord) ---
  { iso3: 'MAR', isoNumeric: '504', name_fr: 'Maroc', name_en: 'Morocco', group: 'UAPNA', ports: 'Agence Nationale des Ports (ANP) / Tanger Med Port Authority / Marsa Maroc', timezone: 'Africa/Casablanca' },
  { iso3: 'DZA', isoNumeric: '012', name_fr: 'Algérie', name_en: 'Algeria', group: 'UAPNA', ports: "Entreprise Portuaire d'Alger / EPB Béjaïa / EPO Oran", timezone: 'Africa/Algiers' },
  { iso3: 'TUN', isoNumeric: '788', name_fr: 'Tunisie', name_en: 'Tunisia', group: 'UAPNA', ports: 'Office de la Marine Marchande et des Ports (OMMP) — Radès, Sfax, Bizerte, Gabès', timezone: 'Africa/Tunis' },
  { iso3: 'LBY', isoNumeric: '434', name_fr: 'Libye', name_en: 'Libya', group: 'UAPNA', ports: 'General Ports Authority (GPA Libya) — Tripoli, Benghazi, Misrata', timezone: 'Africa/Tripoli' },
  { iso3: 'EGY', isoNumeric: '818', name_fr: 'Égypte', name_en: 'Egypt', group: 'UAPNA', ports: 'Alexandria Port Authority / Suez Canal Authority / Damietta Port Authority', timezone: 'Africa/Cairo' },
  { iso3: 'SDN', isoNumeric: '729', name_fr: 'Soudan', name_en: 'Sudan', group: 'UAPNA', ports: 'Sea Ports Corporation (Sudan) — Port-Soudan', timezone: 'Africa/Khartoum' },
]

export const GROUP_COLORS = {
  AGPAOC: '#00367F',
  UAPNA: '#1798F4',
  DUAL: '#0B8A6E',
}

export const NEUTRAL_COUNTRY_COLOR = '#dfe4ec'
