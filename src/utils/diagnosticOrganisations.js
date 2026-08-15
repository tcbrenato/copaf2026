// Organisations/autorités portuaires africaines pour l'identification à deux
// niveaux du Diagnostic Smart Port (organisation -> site precis si elle en
// gere plusieurs). Regroupe par les 3 grands reseaux regionaux, bilingue
// FR/EN. Independant de src/utils/portsData.js (utilise par le formulaire
// d'inscription) : les identifiants ci-dessous sont propres au diagnostic et
// ne doivent jamais etre renommes une fois des diagnostics soumis en base
// (seuls les libelles `nom`/`sites[].nom` peuvent etre corriges).

export const RESEAUX = {
  agpaoc: { fr: "AGPAOC / PMAWCA — Afrique de l'Ouest et du Centre", en: 'AGPAOC / PMAWCA — West & Central Africa' },
  pmaesa: { fr: "PMAESA — Afrique de l'Est, Australe et Océan Indien", en: 'PMAESA — East, Southern Africa & Indian Ocean' },
  uapna: { fr: 'UAPNA — Afrique du Nord', en: 'UAPNA — North Africa' },
  associe: { fr: 'Membres associés (pays enclavés)', en: 'Associate members (landlocked countries)' },
}

export const ORGANISATIONS = [
  // ── AGPAOC / PMAWCA ──
  { id: 'org-nouakchott', network: 'agpaoc', country: 'Mauritanie', nom: { fr: 'Port Autonome de Nouakchott', en: 'Port Autonome de Nouakchott' } },
  { id: 'org-dakar', network: 'agpaoc', country: 'Senegal', nom: { fr: 'Port Autonome de Dakar', en: 'Port Autonome de Dakar' } },
  { id: 'org-gambia', network: 'agpaoc', country: 'Gambie', nom: { fr: 'Gambia Ports Authority', en: 'Gambia Ports Authority' }, sites: [
    { id: 'site-banjul', nom: { fr: 'Banjul', en: 'Banjul' } },
  ] },
  { id: 'org-bissau', network: 'agpaoc', country: 'Guinee-Bissau', nom: { fr: 'Port de Bissau', en: 'Port of Bissau' } },
  { id: 'org-conakry', network: 'agpaoc', country: 'Guinee', nom: { fr: 'Port Autonome de Conakry', en: 'Port Autonome de Conakry' } },
  { id: 'org-sierra-leone', network: 'agpaoc', country: 'Sierra Leone', nom: { fr: 'Sierra Leone Ports Authority', en: 'Sierra Leone Ports Authority' }, sites: [
    { id: 'site-freetown', nom: { fr: 'Freetown', en: 'Freetown' } },
  ] },
  { id: 'org-liberia', network: 'agpaoc', country: 'Liberia', nom: { fr: 'National Port Authority', en: 'National Port Authority' }, sites: [
    { id: 'site-monrovia', nom: { fr: 'Monrovia', en: 'Monrovia' } },
  ] },
  { id: 'org-abidjan', network: 'agpaoc', country: "Cote d'Ivoire", nom: { fr: "Port Autonome d'Abidjan", en: "Port Autonome d'Abidjan" } },
  { id: 'org-san-pedro', network: 'agpaoc', country: "Cote d'Ivoire", nom: { fr: 'Port de San Pedro', en: 'Port of San Pedro' } },
  { id: 'org-ghana', network: 'agpaoc', country: 'Ghana', nom: { fr: 'Ghana Ports & Harbours Authority', en: 'Ghana Ports & Harbours Authority' }, sites: [
    { id: 'site-tema', nom: { fr: 'Tema', en: 'Tema' } },
    { id: 'site-takoradi', nom: { fr: 'Takoradi', en: 'Takoradi' } },
  ] },
  { id: 'org-lome', network: 'agpaoc', country: 'Togo', nom: { fr: 'Port Autonome de Lome', en: 'Port Autonome de Lome' } },
  { id: 'org-cotonou', network: 'agpaoc', country: 'Benin', nom: { fr: 'Port Autonome de Cotonou', en: 'Port Autonome de Cotonou' } },
  { id: 'org-nigeria', network: 'agpaoc', country: 'Nigeria', nom: { fr: 'Nigerian Ports Authority', en: 'Nigerian Ports Authority' }, sites: [
    { id: 'site-lagos', nom: { fr: 'Lagos / Apapa', en: 'Lagos / Apapa' } },
    { id: 'site-port-harcourt', nom: { fr: 'Port Harcourt', en: 'Port Harcourt' } },
    { id: 'site-onne', nom: { fr: 'Onne', en: 'Onne' } },
    { id: 'site-calabar', nom: { fr: 'Calabar', en: 'Calabar' } },
  ] },
  { id: 'org-douala', network: 'agpaoc', country: 'Cameroun', nom: { fr: 'Port Autonome de Douala', en: 'Port Autonome de Douala' } },
  { id: 'org-kribi', network: 'agpaoc', country: 'Cameroun', nom: { fr: 'Port de Kribi', en: 'Port of Kribi' } },
  { id: 'org-malabo', network: 'agpaoc', country: 'Guinee Equatoriale', nom: { fr: 'Port de Malabo', en: 'Port of Malabo' } },
  { id: 'org-bata', network: 'agpaoc', country: 'Guinee Equatoriale', nom: { fr: 'Port de Bata', en: 'Port of Bata' } },
  { id: 'org-oprag', network: 'agpaoc', country: 'Gabon', nom: { fr: 'OPRAG', en: 'OPRAG' }, sites: [
    { id: 'site-port-gentil', nom: { fr: 'Port-Gentil', en: 'Port-Gentil' } },
    { id: 'site-owendo', nom: { fr: 'Owendo', en: 'Owendo' } },
  ] },
  { id: 'org-pointe-noire', network: 'agpaoc', country: 'Congo', nom: { fr: 'Port Autonome de Pointe-Noire', en: 'Port Autonome de Pointe-Noire' } },
  { id: 'org-matadi', network: 'agpaoc', country: 'RDC', nom: { fr: 'Regie des Voies Fluviales / Port de Matadi', en: 'Regie des Voies Fluviales / Port of Matadi' } },
  { id: 'org-luanda', network: 'agpaoc', country: 'Angola', nom: { fr: 'Porto do Luanda', en: 'Porto do Luanda' } },
  { id: 'org-enapor', network: 'agpaoc', country: 'Cap-Vert', nom: { fr: 'Enapor', en: 'Enapor' }, sites: [
    { id: 'site-praia', nom: { fr: 'Praia', en: 'Praia' } },
    { id: 'site-mindelo', nom: { fr: 'Mindelo', en: 'Mindelo' } },
  ] },

  // ── PMAESA ──
  { id: 'org-kenya', network: 'pmaesa', country: 'Kenya', nom: { fr: 'Kenya Ports Authority', en: 'Kenya Ports Authority' }, sites: [
    { id: 'site-mombasa', nom: { fr: 'Mombasa', en: 'Mombasa' } },
    { id: 'site-lamu', nom: { fr: 'Lamu', en: 'Lamu' } },
  ] },
  { id: 'org-tanzania', network: 'pmaesa', country: 'Tanzanie', nom: { fr: 'Tanzania Ports Authority', en: 'Tanzania Ports Authority' }, sites: [
    { id: 'site-dar-es-salaam', nom: { fr: 'Dar es Salaam', en: 'Dar es Salaam' } },
    { id: 'site-tanga', nom: { fr: 'Tanga', en: 'Tanga' } },
    { id: 'site-mtwara', nom: { fr: 'Mtwara', en: 'Mtwara' } },
  ] },
  { id: 'org-zanzibar', network: 'pmaesa', country: 'Tanzanie', nom: { fr: 'Zanzibar Ports Corporation', en: 'Zanzibar Ports Corporation' } },
  { id: 'org-ouganda', network: 'pmaesa', country: 'Ouganda', nom: { fr: 'Ministry of Works and Transport (ports lacustres)', en: 'Ministry of Works and Transport (lake ports)' } },
  { id: 'org-maputo', network: 'pmaesa', country: 'Mozambique', nom: { fr: 'Maputo Port Development Company', en: 'Maputo Port Development Company' } },
  { id: 'org-beira', network: 'pmaesa', country: 'Mozambique', nom: { fr: 'Port de Beira', en: 'Port of Beira' } },
  { id: 'org-nacala', network: 'pmaesa', country: 'Mozambique', nom: { fr: 'Port de Nacala', en: 'Port of Nacala' } },
  { id: 'org-transnet', network: 'pmaesa', country: 'Afrique du Sud', nom: { fr: 'Transnet National Ports Authority', en: 'Transnet National Ports Authority' }, sites: [
    { id: 'site-durban', nom: { fr: 'Durban', en: 'Durban' } },
    { id: 'site-cape-town', nom: { fr: 'Cape Town', en: 'Cape Town' } },
    { id: 'site-ngqura', nom: { fr: 'Ngqura', en: 'Ngqura' } },
    { id: 'site-port-elizabeth', nom: { fr: 'Port Elizabeth', en: 'Port Elizabeth' } },
  ] },
  { id: 'org-namport', network: 'pmaesa', country: 'Namibie', nom: { fr: 'Namibian Ports Authority', en: 'Namibian Ports Authority' }, sites: [
    { id: 'site-walvis-bay', nom: { fr: 'Walvis Bay', en: 'Walvis Bay' } },
    { id: 'site-luderitz', nom: { fr: 'Luderitz', en: 'Luderitz' } },
  ] },
  { id: 'org-djibouti', network: 'pmaesa', country: 'Djibouti', nom: { fr: 'Port Autonome International de Djibouti', en: 'Port Autonome International de Djibouti' } },
  { id: 'org-sudan', network: 'pmaesa', country: 'Soudan', nom: { fr: 'Sea Ports Corporation', en: 'Sea Ports Corporation' }, sites: [
    { id: 'site-port-sudan', nom: { fr: 'Port Sudan', en: 'Port Sudan' } },
  ] },
  { id: 'org-mauritius', network: 'pmaesa', country: 'Maurice', nom: { fr: 'Mauritius Ports Authority', en: 'Mauritius Ports Authority' }, sites: [
    { id: 'site-port-louis', nom: { fr: 'Port Louis', en: 'Port Louis' } },
  ] },
  { id: 'org-mogadiscio', network: 'pmaesa', country: 'Somalie', nom: { fr: 'Port de Mogadiscio', en: 'Port of Mogadishu' } },
  { id: 'org-berbera', network: 'pmaesa', country: 'Somalie', nom: { fr: 'Port de Berbera', en: 'Port of Berbera' } },
  { id: 'org-massawa', network: 'pmaesa', country: 'Erythree', nom: { fr: 'Port de Massawa', en: 'Port of Massawa' } },
  { id: 'org-assab', network: 'pmaesa', country: 'Erythree', nom: { fr: "Port d'Assab", en: 'Port of Assab' } },
  { id: 'org-moroni', network: 'pmaesa', country: 'Comores', nom: { fr: 'Port de Moroni', en: 'Port of Moroni' } },
  { id: 'org-toamasina', network: 'pmaesa', country: 'Madagascar', nom: { fr: 'Societe de Gestion du Port Autonome', en: 'Societe de Gestion du Port Autonome' }, sites: [
    { id: 'site-toamasina', nom: { fr: 'Toamasina', en: 'Toamasina' } },
  ] },
  { id: 'org-victoria', network: 'pmaesa', country: 'Seychelles', nom: { fr: 'Port Victoria', en: 'Port Victoria' } },

  // ── UAPNA ──
  { id: 'org-anp', network: 'uapna', country: 'Maroc', nom: { fr: 'Agence Nationale des Ports (ANP)', en: 'National Ports Agency (ANP)' }, sites: [
    { id: 'site-casablanca', nom: { fr: 'Casablanca', en: 'Casablanca' } },
    { id: 'site-tanger-med', nom: { fr: 'Tanger Med', en: 'Tanger Med' } },
    { id: 'site-agadir', nom: { fr: 'Agadir', en: 'Agadir' } },
  ] },
  { id: 'org-ep-alger', network: 'uapna', country: 'Algerie', nom: { fr: "Entreprise Portuaire d'Alger", en: "Entreprise Portuaire d'Alger" } },
  { id: 'org-ep-oran', network: 'uapna', country: 'Algerie', nom: { fr: "Entreprise Portuaire d'Oran", en: "Entreprise Portuaire d'Oran" } },
  { id: 'org-ep-bejaia', network: 'uapna', country: 'Algerie', nom: { fr: 'Entreprise Portuaire de Bejaia', en: 'Entreprise Portuaire de Bejaia' } },
  { id: 'org-ep-skikda', network: 'uapna', country: 'Algerie', nom: { fr: 'Entreprise Portuaire de Skikda', en: 'Entreprise Portuaire de Skikda' } },
  { id: 'org-ommp', network: 'uapna', country: 'Tunisie', nom: { fr: 'Office de la Marine Marchande et des Ports', en: 'Office de la Marine Marchande et des Ports' }, sites: [
    { id: 'site-rades', nom: { fr: 'Rades', en: 'Rades' } },
    { id: 'site-sfax', nom: { fr: 'Sfax', en: 'Sfax' } },
  ] },
  { id: 'org-gpa-libye', network: 'uapna', country: 'Libye', nom: { fr: 'General Ports Authority', en: 'General Ports Authority' }, sites: [
    { id: 'site-tripoli', nom: { fr: 'Tripoli', en: 'Tripoli' } },
    { id: 'site-benghazi', nom: { fr: 'Benghazi', en: 'Benghazi' } },
    { id: 'site-misrata', nom: { fr: 'Misrata', en: 'Misrata' } },
  ] },
  { id: 'org-pla-egypte', network: 'uapna', country: 'Egypte', nom: { fr: 'Ports & Lighthouses Authority', en: 'Ports & Lighthouses Authority' }, sites: [
    { id: 'site-alexandrie', nom: { fr: 'Alexandrie', en: 'Alexandria' } },
    { id: 'site-port-said', nom: { fr: 'Port-Said', en: 'Port Said' } },
    { id: 'site-damiette', nom: { fr: 'Damiette', en: 'Damietta' } },
  ] },

  // ── Membres associes (pays enclaves) ──
  { id: 'org-mali', network: 'associe', country: 'Mali', nom: { fr: 'Autorite portuaire associee (Mali)', en: 'Associate port authority (Mali)' } },
  { id: 'org-burkina-faso', network: 'associe', country: 'Burkina Faso', nom: { fr: 'Autorite portuaire associee (Burkina Faso)', en: 'Associate port authority (Burkina Faso)' } },
  { id: 'org-niger', network: 'associe', country: 'Niger', nom: { fr: 'Autorite portuaire associee (Niger)', en: 'Associate port authority (Niger)' } },
  { id: 'org-tchad', network: 'associe', country: 'Tchad', nom: { fr: 'Autorite portuaire associee (Tchad)', en: 'Associate port authority (Chad)' } },
  { id: 'org-rca', network: 'associe', country: 'Republique Centrafricaine', nom: { fr: 'Autorite portuaire associee (RCA)', en: 'Associate port authority (CAR)' } },
]

export const ORG_AUTRE = {
  id: 'autre',
  nom: { fr: 'Autre / mon organisation ne figure pas dans la liste', en: 'Other / my organisation is not listed' },
}

export function getOrganisationsByNetwork() {
  return Object.keys(RESEAUX).map(network => ({
    network,
    label: RESEAUX[network],
    organisations: ORGANISATIONS.filter(o => o.network === network),
  }))
}

export function findOrganisationById(id) {
  return ORGANISATIONS.find(o => o.id === id)
}

export function searchOrganisations(query, lang) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return ORGANISATIONS
  return ORGANISATIONS.filter(o =>
    (o.nom[lang] || o.nom.fr).toLowerCase().includes(q) ||
    (o.country || '').toLowerCase().includes(q) ||
    (o.sites || []).some(s => (s.nom[lang] || s.nom.fr).toLowerCase().includes(q))
  )
}
