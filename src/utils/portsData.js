// Liste des ports / autorités portuaires africaines, groupée par association
// régionale (les 3 associations qui coopèrent entre elles au sein de la PAPC
// — Pan-African Association for Port Co-operation).
//
// value = identifiant stable STOCKÉ EN BASE. Ne jamais renommer une valeur
// existante (ça casserait l'historique des inscriptions déjà enregistrées) —
// pour corriger un libellé, modifie uniquement `label`.
// label = { fr, en } affiché selon la langue choisie sur le formulaire.

export const PORTS_GROUPED = [
  {
    group: { fr: "AGPAOC / PMAWCA — Afrique de l'Ouest et du Centre", en: 'AGPAOC / PMAWCA — West & Central Africa' },
    options: [
      { value: 'port-nouakchott', label: { fr: 'Port Autonome de Nouakchott (Mauritanie)', en: 'Port Autonome de Nouakchott (Mauritania)' } },
      { value: 'port-dakar', label: { fr: 'Port Autonome de Dakar (Senegal)', en: 'Port Autonome de Dakar (Senegal)' } },
      { value: 'gambia-ports-authority', label: { fr: 'Gambia Ports Authority - Banjul (Gambie)', en: 'Gambia Ports Authority - Banjul (The Gambia)' } },
      { value: 'port-bissau', label: { fr: 'Port de Bissau (Guinee-Bissau)', en: 'Port of Bissau (Guinea-Bissau)' } },
      { value: 'port-conakry', label: { fr: 'Port Autonome de Conakry (Guinee)', en: 'Port Autonome de Conakry (Guinea)' } },
      { value: 'sierra-leone-ports-authority', label: { fr: 'Sierra Leone Ports Authority - Freetown', en: 'Sierra Leone Ports Authority - Freetown' } },
      { value: 'national-port-authority-liberia', label: { fr: 'National Port Authority - Monrovia (Liberia)', en: 'National Port Authority - Monrovia (Liberia)' } },
      { value: 'port-abidjan', label: { fr: "Port Autonome d'Abidjan (Cote d'Ivoire)", en: "Port Autonome d'Abidjan (Ivory Coast)" } },
      { value: 'port-san-pedro', label: { fr: "Port de San Pedro (Cote d'Ivoire)", en: 'Port of San Pedro (Ivory Coast)' } },
      { value: 'ghana-ports-tema', label: { fr: 'Ghana Ports & Harbours Authority - Tema', en: 'Ghana Ports & Harbours Authority - Tema' } },
      { value: 'ghana-ports-takoradi', label: { fr: 'Ghana Ports & Harbours Authority - Takoradi', en: 'Ghana Ports & Harbours Authority - Takoradi' } },
      { value: 'port-lome', label: { fr: 'Port Autonome de Lome (Togo)', en: 'Port Autonome de Lome (Togo)' } },
      { value: 'port-cotonou', label: { fr: 'Port Autonome de Cotonou (Benin)', en: 'Port Autonome de Cotonou (Benin)' } },
      { value: 'nigerian-ports-lagos', label: { fr: 'Nigerian Ports Authority - Lagos/Apapa', en: 'Nigerian Ports Authority - Lagos/Apapa' } },
      { value: 'nigerian-ports-port-harcourt', label: { fr: 'Nigerian Ports Authority - Port Harcourt', en: 'Nigerian Ports Authority - Port Harcourt' } },
      { value: 'nigerian-ports-onne', label: { fr: 'Nigerian Ports Authority - Onne', en: 'Nigerian Ports Authority - Onne' } },
      { value: 'nigerian-ports-calabar', label: { fr: 'Nigerian Ports Authority - Calabar', en: 'Nigerian Ports Authority - Calabar' } },
      { value: 'port-douala', label: { fr: 'Port Autonome de Douala (Cameroun)', en: 'Port Autonome de Douala (Cameroon)' } },
      { value: 'port-kribi', label: { fr: 'Port de Kribi (Cameroun)', en: 'Port of Kribi (Cameroon)' } },
      { value: 'port-malabo', label: { fr: 'Port de Malabo (Guinee Equatoriale)', en: 'Port of Malabo (Equatorial Guinea)' } },
      { value: 'port-bata', label: { fr: 'Port de Bata (Guinee Equatoriale)', en: 'Port of Bata (Equatorial Guinea)' } },
      { value: 'oprag-port-gentil', label: { fr: 'OPRAG - Port-Gentil (Gabon)', en: 'OPRAG - Port-Gentil (Gabon)' } },
      { value: 'oprag-owendo', label: { fr: 'OPRAG - Owendo (Gabon)', en: 'OPRAG - Owendo (Gabon)' } },
      { value: 'port-pointe-noire', label: { fr: 'Port Autonome de Pointe-Noire (Congo)', en: 'Port Autonome de Pointe-Noire (Congo)' } },
      { value: 'port-matadi', label: { fr: 'Regie des Voies Fluviales / Port de Matadi (RDC)', en: 'Regie des Voies Fluviales / Port of Matadi (DR Congo)' } },
      { value: 'porto-luanda', label: { fr: 'Porto do Luanda (Angola)', en: 'Porto do Luanda (Angola)' } },
      { value: 'enapor-praia', label: { fr: 'Enapor - Praia (Cap-Vert)', en: 'Enapor - Praia (Cape Verde)' } },
      { value: 'enapor-mindelo', label: { fr: 'Enapor - Mindelo (Cap-Vert)', en: 'Enapor - Mindelo (Cape Verde)' } },
    ],
  },
  {
    group: { fr: "PMAESA — Afrique de l'Est, Australe et Ocean Indien", en: 'PMAESA — East, Southern Africa & Indian Ocean' },
    options: [
      { value: 'kenya-ports-mombasa', label: { fr: 'Kenya Ports Authority - Mombasa', en: 'Kenya Ports Authority - Mombasa' } },
      { value: 'kenya-ports-lamu', label: { fr: 'Kenya Ports Authority - Lamu', en: 'Kenya Ports Authority - Lamu' } },
      { value: 'tanzania-ports-dar-es-salaam', label: { fr: 'Tanzania Ports Authority - Dar es Salaam', en: 'Tanzania Ports Authority - Dar es Salaam' } },
      { value: 'tanzania-ports-tanga', label: { fr: 'Tanzania Ports Authority - Tanga', en: 'Tanzania Ports Authority - Tanga' } },
      { value: 'tanzania-ports-mtwara', label: { fr: 'Tanzania Ports Authority - Mtwara', en: 'Tanzania Ports Authority - Mtwara' } },
      { value: 'ouganda-ports-lacustres', label: { fr: 'Ministry of Works and Transport - ports lacustres (Ouganda)', en: 'Ministry of Works and Transport - lake ports (Uganda)' } },
      { value: 'maputo-port', label: { fr: 'Maputo Port Development Company (Mozambique)', en: 'Maputo Port Development Company (Mozambique)' } },
      { value: 'beira-port', label: { fr: 'Port de Beira (Mozambique)', en: 'Port of Beira (Mozambique)' } },
      { value: 'nacala-port', label: { fr: 'Port de Nacala (Mozambique)', en: 'Port of Nacala (Mozambique)' } },
      { value: 'transnet-durban', label: { fr: 'Transnet National Ports Authority - Durban', en: 'Transnet National Ports Authority - Durban' } },
      { value: 'transnet-cape-town', label: { fr: 'Transnet National Ports Authority - Cape Town', en: 'Transnet National Ports Authority - Cape Town' } },
      { value: 'transnet-ngqura', label: { fr: 'Transnet National Ports Authority - Ngqura', en: 'Transnet National Ports Authority - Ngqura' } },
      { value: 'transnet-port-elizabeth', label: { fr: 'Transnet National Ports Authority - Port Elizabeth', en: 'Transnet National Ports Authority - Port Elizabeth' } },
      { value: 'namport-walvis-bay', label: { fr: 'Namibian Ports Authority - Walvis Bay', en: 'Namibian Ports Authority - Walvis Bay' } },
      { value: 'namport-luderitz', label: { fr: 'Namibian Ports Authority - Luderitz', en: 'Namibian Ports Authority - Luderitz' } },
      { value: 'port-djibouti', label: { fr: 'Port Autonome International de Djibouti', en: 'Port Autonome International de Djibouti' } },
      { value: 'port-sudan', label: { fr: 'Sea Ports Corporation - Port Sudan (Soudan)', en: 'Sea Ports Corporation - Port Sudan (Sudan)' } },
      { value: 'mauritius-ports-authority', label: { fr: 'Mauritius Ports Authority - Port Louis', en: 'Mauritius Ports Authority - Port Louis' } },
      { value: 'port-mogadiscio', label: { fr: 'Port de Mogadiscio (Somalie)', en: 'Port of Mogadishu (Somalia)' } },
      { value: 'port-berbera', label: { fr: 'Port de Berbera (Somalie)', en: 'Port of Berbera (Somalia)' } },
      { value: 'port-massawa', label: { fr: 'Port de Massawa (Erythree)', en: 'Port of Massawa (Eritrea)' } },
      { value: 'port-assab', label: { fr: "Port d'Assab (Erythree)", en: 'Port of Assab (Eritrea)' } },
      { value: 'port-moroni', label: { fr: 'Port de Moroni (Comores)', en: 'Port of Moroni (Comoros)' } },
      { value: 'port-toamasina', label: { fr: 'Societe de Gestion du Port Autonome - Toamasina (Madagascar)', en: 'Societe de Gestion du Port Autonome - Toamasina (Madagascar)' } },
      { value: 'port-victoria', label: { fr: 'Port Victoria (Seychelles)', en: 'Port Victoria (Seychelles)' } },
      { value: 'zanzibar-ports-corporation', label: { fr: 'Zanzibar Ports Corporation', en: 'Zanzibar Ports Corporation' } },
    ],
  },
  {
    group: { fr: 'UAPNA — Afrique du Nord', en: 'UAPNA — North Africa' },
    options: [
      { value: 'anp-casablanca', label: { fr: 'Agence Nationale des Ports - Casablanca (Maroc)', en: 'Agence Nationale des Ports - Casablanca (Morocco)' } },
      { value: 'anp-tanger-med', label: { fr: 'Agence Nationale des Ports - Tanger Med (Maroc)', en: 'Agence Nationale des Ports - Tanger Med (Morocco)' } },
      { value: 'anp-agadir', label: { fr: 'Agence Nationale des Ports - Agadir (Maroc)', en: 'Agence Nationale des Ports - Agadir (Morocco)' } },
      { value: 'epa-alger', label: { fr: "Entreprise Portuaire d'Alger (Algerie)", en: "Entreprise Portuaire d'Alger (Algeria)" } },
      { value: 'epa-oran', label: { fr: "Entreprise Portuaire d'Oran (Algerie)", en: "Entreprise Portuaire d'Oran (Algeria)" } },
      { value: 'epa-bejaia', label: { fr: 'Entreprise Portuaire de Bejaia (Algerie)', en: 'Entreprise Portuaire de Bejaia (Algeria)' } },
      { value: 'epa-skikda', label: { fr: 'Entreprise Portuaire de Skikda (Algerie)', en: 'Entreprise Portuaire de Skikda (Algeria)' } },
      { value: 'ommp-rades', label: { fr: 'Office de la Marine Marchande et des Ports - Rades (Tunisie)', en: 'Office de la Marine Marchande et des Ports - Rades (Tunisia)' } },
      { value: 'ommp-sfax', label: { fr: 'Office de la Marine Marchande et des Ports - Sfax (Tunisie)', en: 'Office de la Marine Marchande et des Ports - Sfax (Tunisia)' } },
      { value: 'gpa-tripoli', label: { fr: 'General Ports Authority - Tripoli (Libye)', en: 'General Ports Authority - Tripoli (Libya)' } },
      { value: 'gpa-benghazi', label: { fr: 'General Ports Authority - Benghazi (Libye)', en: 'General Ports Authority - Benghazi (Libya)' } },
      { value: 'gpa-misrata', label: { fr: 'General Ports Authority - Misrata (Libye)', en: 'General Ports Authority - Misrata (Libya)' } },
      { value: 'pla-alexandrie', label: { fr: 'Ports & Lighthouses Authority - Alexandrie (Egypte)', en: 'Ports & Lighthouses Authority - Alexandria (Egypt)' } },
      { value: 'pla-port-said', label: { fr: 'Ports & Lighthouses Authority - Port-Said (Egypte)', en: 'Ports & Lighthouses Authority - Port Said (Egypt)' } },
      { value: 'pla-damiette', label: { fr: 'Ports & Lighthouses Authority - Damiette (Egypte)', en: 'Ports & Lighthouses Authority - Damietta (Egypt)' } },
    ],
  },
  {
    group: { fr: 'Membres associes (pays enclaves)', en: 'Associate members (landlocked countries)' },
    options: [
      { value: 'associe-mali', label: { fr: 'Autorite portuaire associee - Mali', en: 'Associate port authority - Mali' } },
      { value: 'associe-burkina-faso', label: { fr: 'Autorite portuaire associee - Burkina Faso', en: 'Associate port authority - Burkina Faso' } },
      { value: 'associe-niger', label: { fr: 'Autorite portuaire associee - Niger', en: 'Associate port authority - Niger' } },
      { value: 'associe-tchad', label: { fr: 'Autorite portuaire associee - Tchad', en: 'Associate port authority - Chad' } },
      { value: 'associe-rca', label: { fr: 'Autorite portuaire associee - Republique Centrafricaine', en: 'Associate port authority - Central African Republic' } },
    ],
  },
]

// Option "Autre" — hors liste, fait apparaitre un champ texte libre dans le
// formulaire (entreprises, organisations non-portuaires, etc.).
export const PORTS_AUTRE = {
  value: 'autre',
  label: { fr: 'Autre (entreprise, organisation non-portuaire)', en: 'Other (company, non-port organisation)' },
}

// Liste à plat, pratique pour retrouver un libellé à partir d'une value.
export const PORTS_FLAT = [...PORTS_GROUPED.flatMap(g => g.options), PORTS_AUTRE]