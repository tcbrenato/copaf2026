// Référentiel du Diagnostic Smart Port COPAF — 10 axes, 6 niveaux (0-5) par
// axe, bilingue FR/EN. Source unique utilisée par le questionnaire
// (DiagnosticSmartPort.jsx), la page résultat (DiagnosticResultat.jsx), le
// PDF (generateDiagnosticPDF.js) et l'admin (AdminDiagnostics.jsx) — ne pas
// dupliquer ce contenu ailleurs.
//
// Chaque description de niveau décrit un FAIT vérifiable ("un audit est
// réalisé au moins une fois par an") plutôt qu'une appréciation ("gouvernance
// mature") : un répondant honnête ne peut pas se sur-noter sans s'en rendre
// compte, puisqu'il sait s'il a fait ce fait ou non.
//
// `actions` : plan d'action statique (pré-écrit, sans IA) affiché sur la page
// résultat selon le score obtenu sur l'axe — faible (0-1), moyen (2-3), bon
// (4-5), mêmes seuils que couleurNiveau() dans DiagnosticResultat.jsx. Reste
// disponible même sans les recommandations IA (optionnelles, approfondissement).

export const ECHELLE = [
  { valeur: 0, nom: { fr: 'Nul', en: 'None' } },
  { valeur: 1, nom: { fr: 'Très faible', en: 'Very low' } },
  { valeur: 2, nom: { fr: 'Faible', en: 'Low' } },
  { valeur: 3, nom: { fr: 'Moyen', en: 'Medium' } },
  { valeur: 4, nom: { fr: 'Bon', en: 'Good' } },
  { valeur: 5, nom: { fr: 'Très bon', en: 'Very good' } },
]

export const AXES = [
  {
    id: 'infrastructure', icone: 'infrastructure',
    nom: { fr: 'Infrastructure digitale & guichet unique', en: 'Digital infrastructure & single window' },
    definition: {
      fr: "Mesure à quel point les démarches administratives (déclarations, autorisations, formalités) sont numérisées et centralisées dans un système unique, accessible en ligne.",
      en: 'Measures how far administrative procedures (declarations, authorisations, formalities) are digitised and centralised in a single system accessible online.',
    },
    niveaux: [
      { fr: "Aucune démarche n'est disponible en version numérique ; tout se fait sur papier.", en: 'No procedure is available in digital form; everything is done on paper.' },
      { fr: "Certains formulaires existent en PDF téléchargeable, mais doivent être imprimés, remplis à la main et déposés physiquement.", en: 'Some forms exist as downloadable PDFs, but must be printed, filled in by hand and submitted in person.' },
      { fr: "Au moins une démarche peut être soumise en ligne (formulaire web ou email), mais chaque système fonctionne séparément, sans compte utilisateur unique.", en: 'At least one procedure can be submitted online (web form or email), but each system works separately, with no single user account.' },
      { fr: "Un portail en ligne unique permet de soumettre une partie des démarches (moins de la moitié), avec un compte utilisateur suivi.", en: 'A single online portal allows part of the procedures (less than half) to be submitted, with a tracked user account.' },
      { fr: "Le portail unique couvre la majorité des démarches (déclarations, autorisations, paiements) et est utilisé par la majorité des usagers du port.", en: 'The single portal covers most procedures (declarations, authorisations, payments) and is used by the majority of port users.' },
      { fr: "Toutes les démarches administratives sont dématérialisées via un guichet unique, interconnecté avec les systèmes des douanes et d'au moins un autre partenaire externe.", en: 'All administrative procedures are fully digital through a single window, interconnected with customs systems and at least one other external partner.' },
    ],
    actions: {
      faible: [
        { fr: 'Identifier les 3 à 5 démarches les plus fréquentes et les numériser en premier (formulaire PDF téléchargeable).', en: 'Identify the 3 to 5 highest-volume procedures and digitise them first (downloadable PDF form).' },
        { fr: 'Créer un point de contact ou une adresse email unique pour recevoir les démarches.', en: 'Create a single point of contact or email address for procedure submissions.' },
        { fr: "Interroger les usagers du port pour identifier la démarche papier la plus pénalisante.", en: 'Survey port users to identify the paperwork bottleneck causing the most friction.' },
      ],
      moyen: [
        { fr: 'Regrouper les formulaires en ligne existants dans un portail unique avec un seul compte utilisateur.', en: 'Consolidate existing online forms into a single portal with one user account.' },
        { fr: "Fixer un objectif chiffré : atteindre 50 % des démarches sous un seul compte d'ici 12 mois.", en: 'Set a target: bring 50% of procedures under a single login within 12 months.' },
        { fr: 'Interconnecter le portail avec le système des douanes sur au moins une démarche.', en: "Interconnect the portal with customs' existing system on at least one procedure." },
      ],
      bon: [
        { fr: 'Étendre la couverture du portail de la majorité vers la quasi-totalité des démarches.', en: 'Extend portal coverage from a majority to near-total coverage of procedures.' },
        { fr: "Ajouter une interconnexion avec un deuxième partenaire externe (transporteur, banque, autorité portuaire régionale).", en: 'Add interoperability with a second external partner (carrier, bank, regional port authority).' },
        { fr: "Formaliser une gouvernance du portail (responsable désigné, niveau de service, support usagers).", en: 'Formalise portal governance (named owner, service level, user support).' },
      ],
    },
  },
  {
    id: 'automatisation', icone: 'automatisation',
    nom: { fr: 'Automatisation des opérations physiques', en: 'Automation of physical operations' },
    definition: {
      fr: "Évalue le niveau d'automatisation des équipements physiques du port — grues, portiques, véhicules de manutention — et leur degré d'autonomie.",
      en: "Assesses the automation level of the port's physical equipment — cranes, gantries, handling vehicles — and their degree of autonomy.",
    },
    niveaux: [
      { fr: "Aucun équipement (grues, portiques, engins de manutention) n'est assisté électroniquement ; toutes les commandes sont manuelles.", en: 'No equipment (cranes, gantries, handling machines) is electronically assisted; all controls are manual.' },
      { fr: "Certains équipements disposent d'une assistance électronique (ex. aide au levage) mais sont pilotés entièrement par un opérateur sur place.", en: 'Some equipment has electronic assistance (e.g. lifting aid) but is fully operated by a worker on site.' },
      { fr: "Au moins un équipement est piloté à distance depuis une salle de contrôle, sans autonomie.", en: 'At least one piece of equipment is remotely operated from a control room, with no autonomy.' },
      { fr: "Un terminal ou une zone dispose d'équipements semi-automatisés (guidage assisté, arrêts automatiques de sécurité).", en: 'A terminal or zone has semi-automated equipment (assisted guidance, automatic safety stops).' },
      { fr: "Un terminal fonctionne avec des équipements automatisés sur la majorité de ses opérations courantes, supervisés à distance.", en: "A terminal operates with automated equipment for most of its routine operations, remotely supervised." },
      { fr: "Des équipements totalement autonomes (portiques ou véhicules sans opérateur) sont utilisés en production sur l'ensemble d'un terminal.", en: "Fully autonomous equipment (unmanned gantries or vehicles) is used in live operation across an entire terminal." },
    ],
    actions: {
      faible: [
        { fr: "Piloter une assistance électronique (aide au levage) sur un équipement à fort trafic.", en: 'Pilot electronic assistance (lifting aid) on one high-traffic piece of equipment.' },
        { fr: "Former les opérateurs aux outils d'assistance électronique avant tout déploiement plus large.", en: 'Train operators on basic electronic assistance tools before wider rollout.' },
        { fr: "Comparer les options d'automatisation disponibles au volume réel de trafic du port.", en: "Benchmark available automation options against the port's actual traffic volume." },
      ],
      moyen: [
        { fr: 'Choisir un terminal ou une zone pilote pour des équipements semi-automatisés avec arrêts de sécurité automatiques.', en: 'Select one terminal or zone to pilot semi-automated equipment with automatic safety stops.' },
        { fr: "Définir des indicateurs pour mesurer le gain du pilotage à distance par rapport au pilotage sur place.", en: 'Define KPIs to measure the gains of remote operation versus on-site operation.' },
        { fr: "Construire un dossier de justification (coûts/bénéfices) pour automatiser l'opération la plus répétitive du terminal.", en: "Build a cost/benefit case for automating the terminal's most repetitive operation." },
      ],
      bon: [
        { fr: "Étendre l'automatisation de la majorité vers l'intégralité des opérations du terminal.", en: 'Extend automation from a majority to full coverage of the terminal.' },
        { fr: "Évoluer vers des équipements totalement autonomes sur la zone présentant le moins de risques.", en: 'Move toward fully autonomous equipment on the lowest-risk zone first.' },
        { fr: "Partager le retour d'expérience de l'automatisation avec un port partenaire de la région.", en: 'Share automation lessons learned with a partner port in the region.' },
      ],
    },
  },
  {
    id: 'tracabilite', icone: 'tracabilite',
    nom: { fr: 'Traçabilité & partage de données', en: 'Traceability & data sharing' },
    definition: {
      fr: "Mesure la capacité à suivre en temps réel la position et le statut des marchandises, et à partager cette information avec les clients et partenaires.",
      en: 'Measures the ability to track the position and status of goods in real time, and to share that information with customers and partners.',
    },
    niveaux: [
      { fr: "Aucun outil numérique de suivi ; la localisation d'une marchandise s'obtient uniquement par appel téléphonique.", en: 'No digital tracking tool; the location of a shipment can only be obtained by phone call.' },
      { fr: "Un suivi existe sous forme de fichiers internes (tableurs) mis à jour manuellement, non accessibles en dehors du service concerné.", en: 'Tracking exists as internal files (spreadsheets) updated manually, not accessible outside the relevant department.' },
      { fr: "Un système informatique interne centralise le statut des marchandises, mais aucun client ou partenaire externe n'y a accès.", en: 'An internal IT system centralises cargo status, but no external customer or partner has access to it.' },
      { fr: "Les clients peuvent consulter le statut de leur marchandise sur demande (email, portail avec délai), pas en temps réel.", en: 'Customers can check their cargo status on request (email, portal with delay), not in real time.' },
      { fr: "Un portail ou une application permet aux clients de suivre le statut de leur marchandise, mis à jour au moins une fois par jour.", en: 'A portal or app lets customers track their cargo status, updated at least once a day.' },
      { fr: "Un système de suivi en temps réel (mise à jour en continu) est accessible directement par les clients et partenaires via application ou API.", en: 'A real-time tracking system (continuously updated) is directly accessible to customers and partners via app or API.' },
    ],
    actions: {
      faible: [
        { fr: 'Mettre en place un tableau partagé (tableur) visible par les équipes concernées pour remplacer le suivi téléphonique.', en: 'Set up a shared spreadsheet visible to relevant staff to replace phone-only status checks.' },
        { fr: 'Désigner une personne par équipe responsable de tenir un registre écrit des marchandises.', en: 'Assign one person per shift responsible for keeping a written cargo log.' },
        { fr: "Identifier la réclamation client la plus fréquente liée au manque de visibilité, et la traiter en priorité.", en: 'Identify the client complaint most linked to lack of visibility, and fix that flow first.' },
      ],
      moyen: [
        { fr: 'Ouvrir un accès en lecture seule au système interne pour les 5 plus gros clients en volume.', en: 'Open read-only access to the internal tracking system for the top 5 clients by volume.' },
        { fr: 'Fixer un objectif de fréquence de mise à jour : au moins une fois par jour.', en: 'Set an update-frequency target of at least once a day for status changes.' },
        { fr: "Publier une page simple de consultation par numéro de référence, même sans portail complet.", en: 'Publish a simple reference-number lookup page, even without a full portal.' },
      ],
      bon: [
        { fr: "Passer d'une mise à jour quotidienne à un suivi en temps réel sur au moins une étape clé (entrée/sortie de terminal).", en: 'Move from daily updates to real-time tracking for at least one milestone (e.g. gate-in/out).' },
        { fr: 'Ouvrir une API pour les transitaires et partenaires, au-delà du seul portail client.', en: "Open an API for forwarders and partners, beyond the client-facing portal alone." },
        { fr: 'Ajouter des notifications proactives (SMS/email) plutôt que de laisser le client consulter manuellement.', en: 'Add proactive notifications (SMS/email) instead of requiring clients to check manually.' },
      ],
    },
  },
  {
    id: 'ia', icone: 'ia',
    nom: { fr: 'Intelligence artificielle & aide à la décision', en: 'Artificial intelligence & decision support' },
    definition: {
      fr: "Évalue l'usage d'outils d'analyse de données et d'IA pour anticiper et optimiser les opérations (accostage, flux, maintenance) — au-delà de la simple collecte de données.",
      en: 'Assesses the use of data analysis and AI tools to anticipate and optimise operations (berthing, flows, maintenance) — beyond simple data collection.',
    },
    niveaux: [
      { fr: "Aucun outil d'analyse de données n'est utilisé ; les décisions s'appuient uniquement sur l'expérience des équipes.", en: 'No data analysis tool is used; decisions rely solely on staff experience.' },
      { fr: "Des rapports statistiques descriptifs (volumes, délais moyens) sont produits périodiquement, sans outil dédié.", en: 'Descriptive statistical reports (volumes, average delays) are produced periodically, without a dedicated tool.' },
      { fr: "Un tableau de bord numérique présente des indicateurs à jour, mais sans fonction de prévision.", en: 'A digital dashboard shows up-to-date indicators, but with no forecasting function.' },
      { fr: "Un outil produit des prévisions ou recommandations sur un seul processus (ex. prévision d'arrivée des navires).", en: 'A tool produces forecasts or recommendations for a single process (e.g. vessel arrival forecasting).' },
      { fr: "Des modèles prédictifs sont utilisés en routine sur plusieurs processus (accostage, maintenance, flux).", en: 'Predictive models are used routinely across several processes (berthing, maintenance, flows).' },
      { fr: "Des modèles prédictifs sont intégrés en continu dans l'exploitation quotidienne d'au moins trois processus clés, avec un suivi de leur performance.", en: "Predictive models are continuously embedded in the daily operation of at least three key processes, with their performance tracked." },
    ],
    actions: {
      faible: [
        { fr: "Produire un premier rapport descriptif mensuel (volumes, délais moyens), même sans outil dédié.", en: 'Start producing one monthly descriptive report (volumes, average delays), even without dedicated tooling.' },
        { fr: 'Identifier la décision (accostage, planification des portes) qui bénéficierait le plus d\'un appui par la donnée.', en: 'Identify which single decision (berthing, gate scheduling) would benefit most from data support.' },
        { fr: 'Désigner un référent données, même avant la mise en place d\'un tableau de bord.', en: 'Assign a data point-of-contact even before a dashboard exists.' },
      ],
      moyen: [
        { fr: "Ajouter une fonction de prévision sur le processus le plus critique (ex. arrivée des navires).", en: 'Add a forecasting function on the single highest-value process (e.g. vessel arrival).' },
        { fr: 'Tester un modèle prédictif sur un processus pendant 3 mois, en le comparant aux estimations manuelles.', en: 'Pilot a predictive model on one process for 3 months and compare it against manual estimates.' },
        { fr: "Former un analyste interne à l'outil de prévision déjà en place.", en: 'Train one internal analyst on the forecasting tool already installed.' },
      ],
      bon: [
        { fr: 'Étendre les modèles prédictifs à un troisième processus clé (accostage, maintenance ou flux).', en: 'Extend predictive models to a third key process (berthing, maintenance, or flow).' },
        { fr: "Mettre en place un suivi documenté de la performance des modèles déjà utilisés.", en: 'Set up a documented performance-tracking routine for the models already in use.' },
        { fr: "Formaliser une boucle de retour entre les équipes opérationnelles et les responsables des modèles.", en: 'Formalise a feedback loop between operations teams and model owners.' },
      ],
    },
  },
  {
    id: 'cybersecurite', icone: 'cybersecurite',
    nom: { fr: 'Cybersécurité', en: 'Cybersecurity' },
    definition: {
      fr: "Mesure le niveau de protection des systèmes numériques contre les cyberattaques : politiques formalisées, contrôles réguliers, tests concrets.",
      en: 'Measures the level of protection of digital systems against cyberattacks: formal policies, regular controls, concrete tests.',
    },
    niveaux: [
      { fr: "Aucun document ne formalise une politique de cybersécurité.", en: 'No document formalises a cybersecurity policy.' },
      { fr: "Des règles de base existent de manière informelle (ex. mots de passe individuels) sans document écrit.", en: 'Basic rules exist informally (e.g. individual passwords) with no written document.' },
      { fr: "Une politique de cybersécurité écrite existe, mais elle n'a pas été mise à jour depuis plus de deux ans ou n'est pas appliquée par tous les services.", en: "A written cybersecurity policy exists, but has not been updated for more than two years or is not applied by all departments." },
      { fr: "Une politique de cybersécurité écrite et appliquée existe, avec un responsable désigné.", en: 'A written and enforced cybersecurity policy exists, with a designated officer responsible for it.' },
      { fr: "Un audit de sécurité (interne ou externe) est réalisé au moins une fois par an.", en: 'A security audit (internal or external) is carried out at least once a year.' },
      { fr: "Un audit de sécurité externe est réalisé au moins une fois par an, complété par des exercices réguliers (simulation d'incident, test d'intrusion) et une supervision continue des systèmes critiques.", en: 'An external security audit is carried out at least once a year, complemented by regular exercises (incident simulation, penetration testing) and continuous monitoring of critical systems.' },
    ],
    actions: {
      faible: [
        { fr: 'Rédiger une politique de cybersécurité d\'une page (mots de passe, accès, signalement d\'incident).', en: 'Draft a one-page cybersecurity policy covering passwords, access and incident reporting.' },
        { fr: 'Désigner une personne responsable de la cybersécurité, même à temps partiel.', en: 'Assign a named person responsible for cybersecurity, even part-time.' },
        { fr: 'Imposer des mots de passe individuels sur tous les systèmes sous 3 mois.', en: 'Require unique individual passwords on all systems within 3 months.' },
      ],
      moyen: [
        { fr: 'Mettre à jour la politique existante et la faire valider par tous les services.', en: 'Update the existing policy and get sign-off from all departments.' },
        { fr: 'Planifier le premier audit de sécurité (interne ou externe) dans les 12 mois.', en: 'Schedule the first internal or external security audit within 12 months.' },
        { fr: "Déployer l'authentification à deux facteurs sur le système le plus sensible en premier.", en: 'Roll out multi-factor authentication on the most sensitive system first.' },
      ],
      bon: [
        { fr: "Compléter l'audit annuel par un test d'intrusion.", en: "Add a penetration test alongside the existing annual audit." },
        { fr: "Organiser un premier exercice de simulation d'incident avec les équipes opérationnelles.", en: 'Run a first incident-simulation exercise with the operations team.' },
        { fr: 'Mettre en place une supervision continue du système le plus critique.', en: 'Set up continuous monitoring on the most critical system.' },
      ],
    },
  },
  {
    id: 'surete', icone: 'surete',
    nom: { fr: 'Sûreté & sécurité opérationnelle', en: 'Safety & operational security' },
    definition: {
      fr: "Évalue les dispositifs de sûreté physique du site (contrôle d'accès, surveillance, gestion des risques) — distincts de la cybersécurité.",
      en: "Assesses the site's physical security arrangements (access control, surveillance, risk management) — distinct from cybersecurity.",
    },
    niveaux: [
      { fr: "Aucun dispositif de contrôle d'accès ou de surveillance formalisé n'existe sur le site.", en: 'No formal access control or surveillance system exists on site.' },
      { fr: "Un contrôle d'accès existe à l'entrée principale (agent ou badge), sans couverture du reste du site.", en: 'Access control exists at the main entrance (guard or badge), with no coverage of the rest of the site.' },
      { fr: "Le contrôle d'accès et la surveillance (caméras ou rondes) couvrent les zones sensibles identifiées.", en: 'Access control and surveillance (cameras or patrols) cover the identified sensitive areas.' },
      { fr: "Un plan de sûreté écrit couvre l'ensemble du site, avec des responsabilités définies.", en: 'A written security plan covers the entire site, with defined responsibilities.' },
      { fr: "Le plan de sûreté est audité au moins une fois par an et donne lieu à des actions correctives suivies.", en: 'The security plan is audited at least once a year and leads to tracked corrective actions.' },
      { fr: "Le port dispose d'une certification de sûreté internationale en cours de validité (ex. code ISPS) et le dispositif est testé par des exercices réguliers.", en: 'The port holds a valid international security certification (e.g. ISPS code) and the system is tested through regular exercises.' },
    ],
    actions: {
      faible: [
        { fr: "Mettre en place un contrôle d'accès (agent ou badge) à l'entrée principale sous 3 mois.", en: 'Set up access control (guard or badge) at the main entrance within 3 months.' },
        { fr: 'Identifier les 2 à 3 zones les plus sensibles du site à surveiller en priorité.', en: "Identify the site's 2-3 most sensitive zones needing surveillance first." },
        { fr: "Rédiger une liste d'une page des personnes autorisées et de leurs zones d'accès, comme première étape.", en: 'Write a one-page list of who is authorised where, as a first step.' },
      ],
      moyen: [
        { fr: "Rédiger un plan de sûreté écrit couvrant l'ensemble du site, avec des responsabilités définies.", en: 'Draft a written security plan covering the whole site with defined responsibilities.' },
        { fr: 'Étendre la couverture caméras ou les rondes aux zones encore non couvertes.', en: 'Extend camera coverage or patrol routes to zones not yet covered.' },
        { fr: 'Désigner un responsable du plan de sûreté, garant de sa mise à jour.', en: 'Assign an owner accountable for updating the security plan.' },
      ],
      bon: [
        { fr: 'Engager une démarche de certification de sûreté internationale (ex. code ISPS).', en: 'Pursue ISPS or an equivalent international security certification.' },
        { fr: "Organiser un premier exercice de sûreté au-delà de l'audit annuel.", en: 'Run a first security exercise/drill beyond the annual audit.' },
        { fr: "Suivre les actions correctives de l'audit jusqu'à leur clôture, avec échéances.", en: 'Track corrective actions from the audit to closure with deadlines.' },
      ],
    },
  },
  {
    id: 'environnement', icone: 'environnement',
    nom: { fr: 'Énergie & environnement', en: 'Energy & environment' },
    definition: {
      fr: "Mesure les efforts en matière de suivi environnemental et de transition énergétique — pollution, électrification, réduction de l'empreinte carbone.",
      en: "Measures efforts in environmental monitoring and energy transition — pollution, electrification, carbon footprint reduction.",
    },
    niveaux: [
      { fr: "Aucune mesure de pollution (air, eau, bruit) n'est réalisée sur le site.", en: 'No pollution measurement (air, water, noise) is carried out on site.' },
      { fr: "Des mesures ponctuelles et manuelles sont réalisées occasionnellement, sans enregistrement systématique.", en: 'One-off manual measurements are taken occasionally, with no systematic record.' },
      { fr: "Des capteurs ou relevés réguliers existent sur au moins une zone du site, avec un enregistrement des données.", en: 'Sensors or regular readings exist for at least one area of the site, with data recorded.' },
      { fr: "Un suivi environnemental structuré (données consolidées, rapport périodique) couvre la majorité du site.", en: 'A structured environmental monitoring system (consolidated data, periodic report) covers most of the site.' },
      { fr: "Une partie de la flotte ou des équipements du port (véhicules, engins) a été électrifiée ou convertie à une énergie moins polluante.", en: "Part of the port's fleet or equipment (vehicles, machines) has been electrified or converted to a cleaner energy source." },
      { fr: "Un suivi environnemental continu est en place et la majorité de la flotte/des équipements est électrifiée ou décarbonée, avec un objectif chiffré de réduction publié.", en: 'Continuous environmental monitoring is in place and most of the fleet/equipment is electrified or decarbonised, with a published numerical reduction target.' },
    ],
    actions: {
      faible: [
        { fr: 'Réaliser une première campagne de mesure manuelle (air, eau ou bruit) pour établir une base de référence.', en: 'Run one manual measurement campaign (air, water or noise) to establish a baseline.' },
        { fr: "Identifier l'activité la plus polluante du site à surveiller en priorité.", en: 'Identify the single most polluting activity on-site to monitor first.' },
        { fr: "Désigner une équipe responsable de la collecte des données environnementales.", en: 'Assign responsibility for environmental data collection to one team.' },
      ],
      moyen: [
        { fr: 'Étendre les capteurs ou relevés réguliers à une deuxième zone du site.', en: 'Extend regular measurement/sensors to a second site zone.' },
        { fr: 'Consolider les données existantes dans un rapport périodique unique.', en: 'Consolidate existing data into a single periodic report.' },
        { fr: "Fixer un premier objectif d'électrification ou de conversion pour une catégorie de véhicules ou d'engins.", en: 'Set a first target for electrifying or converting one vehicle or equipment category.' },
      ],
      bon: [
        { fr: "Publier un objectif chiffré et daté de décarbonation de la flotte ou des équipements.", en: 'Publish a numerical target and date for full fleet or equipment decarbonisation.' },
        { fr: "Passer d'un suivi périodique à un suivi environnemental continu.", en: 'Move from periodic to continuous environmental monitoring.' },
        { fr: "Étendre l'électrification à une deuxième catégorie d'équipements.", en: 'Extend electrification to a second equipment category.' },
      ],
    },
  },
  {
    id: 'synchromodalite', icone: 'synchromodalite',
    nom: { fr: 'Synchromodalité & intégration multimodale', en: 'Synchromodality & multimodal integration' },
    definition: {
      fr: "Évalue la capacité à coordonner les différents modes de transport (route, rail, fleuve) autour des opérations portuaires, au-delà du seul quai.",
      en: 'Assesses the ability to coordinate different transport modes (road, rail, river) around port operations, beyond the quay itself.',
    },
    niveaux: [
      { fr: "Aucune coordination formalisée n'existe entre le port et les autres modes de transport (route, rail, fleuve).", en: 'No formal coordination exists between the port and other transport modes (road, rail, river).' },
      { fr: "Des échanges d'informations avec les transporteurs routiers/ferroviaires existent au cas par cas, par téléphone ou email.", en: 'Information exchanges with road/rail carriers happen on a case-by-case basis, by phone or email.' },
      { fr: "Un système d'échange d'informations (horaires, disponibilités) existe avec au moins un mode de transport partenaire.", en: 'An information exchange system (schedules, availability) exists with at least one partner transport mode.' },
      { fr: "Les données de disponibilité sont partagées avec les transporteurs de façon régulière, mais le choix du mode de transport reste manuel.", en: 'Availability data is shared with carriers on a regular basis, but the choice of transport mode remains manual.' },
      { fr: "Un outil permet aux clients ou transporteurs de comparer les options multimodales disponibles avant de choisir.", en: 'A tool lets customers or carriers compare available multimodal options before choosing.' },
      { fr: "La planification du transport post-portuaire (route, rail, fleuve) est optimisée en temps réel via un système partagé avec les opérateurs de transport.", en: 'Post-port transport planning (road, rail, river) is optimised in real time through a system shared with transport operators.' },
    ],
    actions: {
      faible: [
        { fr: 'Établir un point de contact unique avec le principal transporteur routier ou ferroviaire du port.', en: "Establish a single point of contact with the port's main road or rail carrier." },
        { fr: 'Consigner les problèmes de coordination récurrents pendant 1 mois pour identifier le principal blocage.', en: 'Log recurring coordination issues (delays, no-shows) for 1 month to identify the biggest gap.' },
        { fr: 'Mettre en place un point hebdomadaire avec le partenaire transport le plus important en volume.', en: 'Set up a weekly call with the top transport partner by volume.' },
      ],
      moyen: [
        { fr: "Formaliser l'échange d'informations (horaires, disponibilités) avec un protocole écrit.", en: 'Formalise the information exchange (schedules, availability) with a written protocol.' },
        { fr: "Ajouter un deuxième mode de transport partenaire au système de partage d'informations.", en: 'Add a second transport mode partner to the information-sharing system.' },
        { fr: "Passer d'échanges au cas par cas à une cadence régulière (ex. quotidienne).", en: 'Move from case-by-case exchanges to a regular reporting cadence (e.g. daily).' },
      ],
      bon: [
        { fr: "Évoluer vers une optimisation en temps réel pour le corridor de transport le plus important.", en: 'Move toward real-time optimisation for the highest-volume transport corridor.' },
        { fr: "Connecter l'outil de comparaison directement aux systèmes des opérateurs de transport.", en: "Connect the comparison tool directly with transport operators' own systems." },
        { fr: 'Étendre la planification en temps réel à un deuxième mode de transport.', en: 'Extend real-time planning to a second transport mode.' },
      ],
    },
  },
  {
    id: 'competences', icone: 'competences',
    nom: { fr: 'Capacités organisationnelles & compétences', en: 'Organisational capacity & skills' },
    definition: {
      fr: "Mesure le niveau de formation et d'appropriation des outils digitaux par les équipes — le facteur humain derrière la technologie.",
      en: "Measures the level of training and ownership of digital tools by staff — the human factor behind the technology.",
    },
    niveaux: [
      { fr: "Aucune formation aux outils numériques n'est proposée au personnel.", en: 'No digital tools training is offered to staff.' },
      { fr: "Des formations ponctuelles ont eu lieu, à l'initiative individuelle, sans plan structuré.", en: 'One-off training sessions have taken place, on individual initiative, with no structured plan.' },
      { fr: "Un plan de formation existe, mais moins d'un quart du personnel concerné l'a suivi à ce jour.", en: 'A training plan exists, but less than a quarter of relevant staff have completed it so far.' },
      { fr: "Un plan de formation structuré a été suivi par la majorité du personnel concerné par les outils numériques.", en: 'A structured training plan has been completed by the majority of staff concerned by digital tools.' },
      { fr: "La formation aux outils numériques est intégrée systématiquement à l'accueil des nouveaux employés et fait l'objet de mises à jour régulières.", en: "Digital tools training is systematically included in onboarding for new employees and is regularly updated." },
      { fr: "Une équipe ou un poste dédié pilote en continu la montée en compétences numériques, avec un suivi individuel des acquis.", en: 'A dedicated team or role continuously drives digital upskilling, with individual tracking of skills gained.' },
    ],
    actions: {
      faible: [
        { fr: "Organiser une première session de formation aux outils numériques pour l'équipe la plus concernée par les lacunes actuelles.", en: 'Run a first digital-tools training session for the team most affected by current gaps.' },
        { fr: "Identifier un partenaire de formation (réseau régional, fournisseur) pour l'outil numérique prioritaire du port.", en: "Identify a training partner (regional network, vendor) for the port's top-priority digital tool." },
        { fr: 'Sonder le personnel pour identifier la principale lacune en compétences numériques.', en: 'Survey staff to find the single biggest digital-skills gap.' },
      ],
      moyen: [
        { fr: 'Fixer un objectif de 50 % de complétion du plan de formation existant sous 12 mois.', en: 'Set a target to reach 50% completion of the existing training plan within 12 months.' },
        { fr: "Intégrer la formation aux outils numériques au parcours d'accueil des nouveaux employés.", en: 'Add digital-tools training to the onboarding process for new hires.' },
        { fr: 'Identifier et lever le principal obstacle empêchant le personnel de suivre la formation.', en: 'Identify and address the main barrier preventing staff from completing training.' },
      ],
      bon: [
        { fr: "Formaliser un cycle de mise à jour récurrent du contenu de formation (ex. rafraîchissement annuel).", en: 'Formalise a recurring update cycle for the training content (e.g. yearly refresh).' },
        { fr: "Créer ou désigner un poste dédié pour piloter la montée en compétences numériques.", en: 'Create or assign a dedicated role to lead ongoing digital upskilling.' },
        { fr: 'Mettre en place un suivi individuel des acquis, au-delà de la seule présence en formation.', en: 'Set up individual tracking of skills gained, not just training attendance.' },
      ],
    },
  },
  {
    id: 'parties_prenantes', icone: 'parties_prenantes',
    nom: { fr: 'Engagement des parties prenantes', en: 'Stakeholder engagement' },
    definition: {
      fr: "Évalue la qualité de la concertation entre le port et son écosystème — douanes, transporteurs, clients, autorités — plutôt que des décisions prises en silo.",
      en: "Assesses the quality of consultation between the port and its ecosystem — customs, carriers, customers, authorities — rather than decisions made in isolation.",
    },
    niveaux: [
      { fr: "Aucun échange formalisé n'existe avec les partenaires (douanes, transporteurs, clients) sur les sujets numériques.", en: 'No formal exchange exists with partners (customs, carriers, customers) on digital topics.' },
      { fr: "Des échanges informels et ponctuels ont lieu, sans ordre du jour ni suivi.", en: 'Informal, occasional exchanges take place, with no agenda or follow-up.' },
      { fr: "Des réunions existent avec certains partenaires, mais de façon irrégulière et sans compte-rendu partagé.", en: 'Meetings take place with some partners, but irregularly and without shared minutes.' },
      { fr: "Un comité ou une instance de concertation se réunit régulièrement avec les principales parties prenantes, avec compte-rendu.", en: 'A committee or consultation body meets regularly with the main stakeholders, with minutes taken.' },
      { fr: "Les décisions concernant les projets numériques du port intègrent systématiquement une consultation préalable des parties prenantes.", en: "Decisions on the port's digital projects systematically include prior consultation with stakeholders." },
      { fr: "Une gouvernance partagée (comité mixte port-douanes-transporteurs-clients) valide conjointement la feuille de route numérique du port.", en: "Shared governance (a joint port-customs-carriers-customers committee) jointly validates the port's digital roadmap." },
    ],
    actions: {
      faible: [
        { fr: 'Planifier une première réunion avec les 3 principaux partenaires (douanes, transporteur principal, client principal) sur les sujets numériques.', en: "Schedule a first meeting with the port's top 3 partners (customs, main carrier, main client) on digital topics." },
        { fr: 'Créer une liste de diffusion partagée pour les mises à jour des projets numériques avec les partenaires.', en: 'Create a shared distribution list for digital-project updates with partners.' },
        { fr: 'Identifier un point de friction récurrent remonté informellement par les partenaires, à traiter en priorité.', en: 'Identify one recurring pain point raised informally by partners to address first.' },
      ],
      moyen: [
        { fr: 'Fixer une cadence de réunion régulière (ex. trimestrielle) avec les principales parties prenantes.', en: 'Set a fixed meeting cadence (e.g. quarterly) with main stakeholders.' },
        { fr: 'Commencer à produire et partager un compte-rendu écrit après chaque réunion.', en: 'Start producing and sharing written minutes after each meeting.' },
        { fr: 'Formaliser le groupe en un comité nommé, avec des membres définis.', en: 'Formalise the group into a named committee with defined membership.' },
      ],
      bon: [
        { fr: 'Intégrer une consultation systématique des parties prenantes avant toute décision sur un nouveau projet numérique.', en: 'Add systematic prior consultation of stakeholders before new digital project decisions.' },
        { fr: 'Évoluer vers une gouvernance partagée (validation conjointe de la feuille de route).', en: 'Expand the committee toward joint governance (shared validation of the roadmap).' },
        { fr: "Formaliser le pouvoir de décision du comité, au-delà d'un simple rôle consultatif.", en: "Formalise the committee's decision-making authority, not just a consultative role." },
      ],
    },
  },
]

// Labels courts (radar chart, tableaux admin, CSV) — bilingue.
export const AXES_LABELS = AXES.reduce((acc, axe) => {
  acc[axe.id] = axe.nom
  return acc
}, {})

export function txt(field, lang) {
  if (!field) return ''
  return field[lang] || field.fr || ''
}
