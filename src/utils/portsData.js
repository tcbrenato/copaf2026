// Liste des ports / autorités portuaires africaines. Chaque entrée porte un
// `country` qui correspond exactement à une `value` du tableau PAYS dans
// Inscription.jsx — c'est ce qui permet de filtrer les organisations
// affichees une fois que la personne a choisi son pays.
//
// value = identifiant stable STOCKÉ EN BASE. Ne jamais renommer une valeur
// existante (ça casserait l'historique des inscriptions déjà enregistrées) —
// pour corriger un libellé, modifie uniquement `label`.
// label = { fr, en } affiché selon la langue choisie sur le formulaire.

export const PORTS = [
  // ── AGPAOC / PMAWCA — Afrique de l'Ouest et du Centre ──
  { value: 'port-nouakchott', country: 'Mauritanie', label: { fr: 'Port Autonome de Nouakchott', en: 'Port Autonome de Nouakchott' } },
  { value: 'port-dakar', country: 'Senegal', label: { fr: 'Port Autonome de Dakar', en: 'Port Autonome de Dakar' } },
  { value: 'gambia-ports-authority', country: 'Gambie', label: { fr: 'Gambia Ports Authority (Banjul)', en: 'Gambia Ports Authority (Banjul)' } },
  { value: 'port-bissau', country: 'Guinee-Bissau', label: { fr: 'Port de Bissau', en: 'Port of Bissau' } },
  { value: 'port-conakry', country: 'Guinee', label: { fr: 'Port Autonome de Conakry', en: 'Port Autonome de Conakry' } },
  { value: 'sierra-leone-ports-authority', country: 'Sierra Leone', label: { fr: 'Sierra Leone Ports Authority (Freetown)', en: 'Sierra Leone Ports Authority (Freetown)' } },
  { value: 'national-port-authority-liberia', country: 'Liberia', label: { fr: 'National Port Authority (Monrovia)', en: 'National Port Authority (Monrovia)' } },
  { value: 'port-abidjan', country: "Cote d'Ivoire", label: { fr: "Port Autonome d'Abidjan", en: "Port Autonome d'Abidjan" } },
  { value: 'port-san-pedro', country: "Cote d'Ivoire", label: { fr: 'Port de San Pedro', en: 'Port of San Pedro' } },
  { value: 'ghana-ports-tema', country: 'Ghana', label: { fr: 'Ghana Ports & Harbours Authority (Tema)', en: 'Ghana Ports & Harbours Authority (Tema)' } },
  { value: 'ghana-ports-takoradi', country: 'Ghana', label: { fr: 'Ghana Ports & Harbours Authority (Takoradi)', en: 'Ghana Ports & Harbours Authority (Takoradi)' } },
  { value: 'port-lome', country: 'Togo', label: { fr: 'Port Autonome de Lome', en: 'Port Autonome de Lome' } },
  { value: 'port-cotonou', country: 'Benin', label: { fr: 'Port Autonome de Cotonou', en: 'Port Autonome de Cotonou' } },
  { value: 'nigerian-ports-lagos', country: 'Nigeria', label: { fr: 'Nigerian Ports Authority (Lagos/Apapa)', en: 'Nigerian Ports Authority (Lagos/Apapa)' } },
  { value: 'nigerian-ports-port-harcourt', country: 'Nigeria', label: { fr: 'Nigerian Ports Authority (Port Harcourt)', en: 'Nigerian Ports Authority (Port Harcourt)' } },
  { value: 'nigerian-ports-onne', country: 'Nigeria', label: { fr: 'Nigerian Ports Authority (Onne)', en: 'Nigerian Ports Authority (Onne)' } },
  { value: 'nigerian-ports-calabar', country: 'Nigeria', label: { fr: 'Nigerian Ports Authority (Calabar)', en: 'Nigerian Ports Authority (Calabar)' } },
  { value: 'port-douala', country: 'Cameroun', label: { fr: 'Port Autonome de Douala', en: 'Port Autonome de Douala' } },
  { value: 'port-kribi', country: 'Cameroun', label: { fr: 'Port de Kribi', en: 'Port of Kribi' } },
  { value: 'port-malabo', country: 'Guinee Equatoriale', label: { fr: 'Port de Malabo', en: 'Port of Malabo' } },
  { value: 'port-bata', country: 'Guinee Equatoriale', label: { fr: 'Port de Bata', en: 'Port of Bata' } },
  { value: 'oprag-port-gentil', country: 'Gabon', label: { fr: 'OPRAG - Port-Gentil', en: 'OPRAG - Port-Gentil' } },
  { value: 'oprag-owendo', country: 'Gabon', label: { fr: 'OPRAG - Owendo', en: 'OPRAG - Owendo' } },
  { value: 'port-pointe-noire', country: 'Congo', label: { fr: 'Port Autonome de Pointe-Noire', en: 'Port Autonome de Pointe-Noire' } },
  { value: 'port-matadi', country: 'RDC', label: { fr: 'Regie des Voies Fluviales / Port de Matadi', en: 'Regie des Voies Fluviales / Port of Matadi' } },
  { value: 'porto-luanda', country: 'Angola', label: { fr: 'Porto do Luanda', en: 'Porto do Luanda' } },
  { value: 'enapor-praia', country: 'Cap-Vert', label: { fr: 'Enapor - Praia', en: 'Enapor - Praia' } },
  { value: 'enapor-mindelo', country: 'Cap-Vert', label: { fr: 'Enapor - Mindelo', en: 'Enapor - Mindelo' } },

  // ── PMAESA — Afrique de l'Est, Australe et Ocean Indien ──
  { value: 'kenya-ports-mombasa', country: 'Kenya', label: { fr: 'Kenya Ports Authority (Mombasa)', en: 'Kenya Ports Authority (Mombasa)' } },
  { value: 'kenya-ports-lamu', country: 'Kenya', label: { fr: 'Kenya Ports Authority (Lamu)', en: 'Kenya Ports Authority (Lamu)' } },
  { value: 'tanzania-ports-dar-es-salaam', country: 'Tanzanie', label: { fr: 'Tanzania Ports Authority (Dar es Salaam)', en: 'Tanzania Ports Authority (Dar es Salaam)' } },
  { value: 'tanzania-ports-tanga', country: 'Tanzanie', label: { fr: 'Tanzania Ports Authority (Tanga)', en: 'Tanzania Ports Authority (Tanga)' } },
  { value: 'tanzania-ports-mtwara', country: 'Tanzanie', label: { fr: 'Tanzania Ports Authority (Mtwara)', en: 'Tanzania Ports Authority (Mtwara)' } },
  { value: 'zanzibar-ports-corporation', country: 'Tanzanie', label: { fr: 'Zanzibar Ports Corporation', en: 'Zanzibar Ports Corporation' } },
  { value: 'ouganda-ports-lacustres', country: 'Ouganda', label: { fr: 'Ministry of Works and Transport - ports lacustres', en: 'Ministry of Works and Transport - lake ports' } },
  { value: 'maputo-port', country: 'Mozambique', label: { fr: 'Maputo Port Development Company', en: 'Maputo Port Development Company' } },
  { value: 'beira-port', country: 'Mozambique', label: { fr: 'Port de Beira', en: 'Port of Beira' } },
  { value: 'nacala-port', country: 'Mozambique', label: { fr: 'Port de Nacala', en: 'Port of Nacala' } },
  { value: 'transnet-durban', country: 'Afrique du Sud', label: { fr: 'Transnet National Ports Authority (Durban)', en: 'Transnet National Ports Authority (Durban)' } },
  { value: 'transnet-cape-town', country: 'Afrique du Sud', label: { fr: 'Transnet National Ports Authority (Cape Town)', en: 'Transnet National Ports Authority (Cape Town)' } },
  { value: 'transnet-ngqura', country: 'Afrique du Sud', label: { fr: 'Transnet National Ports Authority (Ngqura)', en: 'Transnet National Ports Authority (Ngqura)' } },
  { value: 'transnet-port-elizabeth', country: 'Afrique du Sud', label: { fr: 'Transnet National Ports Authority (Port Elizabeth)', en: 'Transnet National Ports Authority (Port Elizabeth)' } },
  { value: 'namport-walvis-bay', country: 'Namibie', label: { fr: 'Namibian Ports Authority (Walvis Bay)', en: 'Namibian Ports Authority (Walvis Bay)' } },
  { value: 'namport-luderitz', country: 'Namibie', label: { fr: 'Namibian Ports Authority (Luderitz)', en: 'Namibian Ports Authority (Luderitz)' } },
  { value: 'port-djibouti', country: 'Djibouti', label: { fr: 'Port Autonome International de Djibouti', en: 'Port Autonome International de Djibouti' } },
  { value: 'port-sudan', country: 'Soudan', label: { fr: 'Sea Ports Corporation (Port Sudan)', en: 'Sea Ports Corporation (Port Sudan)' } },
  { value: 'mauritius-ports-authority', country: 'Maurice', label: { fr: 'Mauritius Ports Authority (Port Louis)', en: 'Mauritius Ports Authority (Port Louis)' } },
  { value: 'port-mogadiscio', country: 'Somalie', label: { fr: 'Port de Mogadiscio', en: 'Port of Mogadishu' } },
  { value: 'port-berbera', country: 'Somalie', label: { fr: 'Port de Berbera', en: 'Port of Berbera' } },
  { value: 'port-massawa', country: 'Erythree', label: { fr: 'Port de Massawa', en: 'Port of Massawa' } },
  { value: 'port-assab', country: 'Erythree', label: { fr: "Port d'Assab", en: 'Port of Assab' } },
  { value: 'port-moroni', country: 'Comores', label: { fr: 'Port de Moroni', en: 'Port of Moroni' } },
  { value: 'port-toamasina', country: 'Madagascar', label: { fr: 'Societe de Gestion du Port Autonome (Toamasina)', en: 'Societe de Gestion du Port Autonome (Toamasina)' } },
  { value: 'port-victoria', country: 'Seychelles', label: { fr: 'Port Victoria', en: 'Port Victoria' } },

  // ── UAPNA — Afrique du Nord ──
  { value: 'anp-casablanca', country: 'Maroc', label: { fr: 'Agence Nationale des Ports (Casablanca)', en: 'Agence Nationale des Ports (Casablanca)' } },
  { value: 'anp-tanger-med', country: 'Maroc', label: { fr: 'Agence Nationale des Ports (Tanger Med)', en: 'Agence Nationale des Ports (Tanger Med)' } },
  { value: 'anp-agadir', country: 'Maroc', label: { fr: 'Agence Nationale des Ports (Agadir)', en: 'Agence Nationale des Ports (Agadir)' } },
  { value: 'epa-alger', country: 'Algerie', label: { fr: "Entreprise Portuaire d'Alger", en: "Entreprise Portuaire d'Alger" } },
  { value: 'epa-oran', country: 'Algerie', label: { fr: "Entreprise Portuaire d'Oran", en: "Entreprise Portuaire d'Oran" } },
  { value: 'epa-bejaia', country: 'Algerie', label: { fr: 'Entreprise Portuaire de Bejaia', en: 'Entreprise Portuaire de Bejaia' } },
  { value: 'epa-skikda', country: 'Algerie', label: { fr: 'Entreprise Portuaire de Skikda', en: 'Entreprise Portuaire de Skikda' } },
  { value: 'ommp-rades', country: 'Tunisie', label: { fr: 'Office de la Marine Marchande et des Ports (Rades)', en: 'Office de la Marine Marchande et des Ports (Rades)' } },
  { value: 'ommp-sfax', country: 'Tunisie', label: { fr: 'Office de la Marine Marchande et des Ports (Sfax)', en: 'Office de la Marine Marchande et des Ports (Sfax)' } },
  { value: 'gpa-tripoli', country: 'Libye', label: { fr: 'General Ports Authority (Tripoli)', en: 'General Ports Authority (Tripoli)' } },
  { value: 'gpa-benghazi', country: 'Libye', label: { fr: 'General Ports Authority (Benghazi)', en: 'General Ports Authority (Benghazi)' } },
  { value: 'gpa-misrata', country: 'Libye', label: { fr: 'General Ports Authority (Misrata)', en: 'General Ports Authority (Misrata)' } },
  { value: 'pla-alexandrie', country: 'Egypte', label: { fr: 'Ports & Lighthouses Authority (Alexandrie)', en: 'Ports & Lighthouses Authority (Alexandria)' } },
  { value: 'pla-port-said', country: 'Egypte', label: { fr: 'Ports & Lighthouses Authority (Port-Said)', en: 'Ports & Lighthouses Authority (Port Said)' } },
  { value: 'pla-damiette', country: 'Egypte', label: { fr: 'Ports & Lighthouses Authority (Damiette)', en: 'Ports & Lighthouses Authority (Damietta)' } },

  // ── Membres associes (pays enclaves) ──
  { value: 'associe-mali', country: 'Mali', label: { fr: 'Autorite portuaire associee', en: 'Associate port authority' } },
  { value: 'associe-burkina-faso', country: 'Burkina Faso', label: { fr: 'Autorite portuaire associee', en: 'Associate port authority' } },
  { value: 'associe-niger', country: 'Niger', label: { fr: 'Autorite portuaire associee', en: 'Associate port authority' } },
  { value: 'associe-tchad', country: 'Tchad', label: { fr: 'Autorite portuaire associee', en: 'Associate port authority' } },
  { value: 'associe-rca', country: 'Republique Centrafricaine', label: { fr: 'Autorite portuaire associee', en: 'Associate port authority' } },
]

// Option "Autre" — toujours proposee, quel que soit le pays choisi (hors
// liste : entreprises, organisations non-portuaires, etc.). Fait apparaitre
// un champ texte libre dans le formulaire.
export const PORTS_AUTRE = {
  value: 'autre',
  label: { fr: 'Autre (entreprise, organisation non-portuaire)', en: 'Other (company, non-port organisation)' },
}

// Renvoie les organisations a proposer pour un pays donne (value du tableau
// PAYS), "Autre" toujours en dernier. Si aucun pays n'est choisi, renvoie [].
export function getOrgOptionsForCountry(countryValue) {
  if (!countryValue) return []
  return [...PORTS.filter(p => p.country === countryValue), PORTS_AUTRE]
}

// Retrouver une organisation a partir de sa value (utile pour re-synchroniser
// le libelle affiche sans repasser par le select, ex. au changement de langue).
export function findPortByValue(value) {
  if (value === PORTS_AUTRE.value) return PORTS_AUTRE
  return PORTS.find(p => p.value === value)
}