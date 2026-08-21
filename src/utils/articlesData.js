// Articles de fond / communiques de presse pour le referencement naturel
// (SEO) du site — objectif : qu'un directeur de port ou un journaliste
// tombe sur COPAF en cherchant des sujets sectoriels ("cybersecurite
// maritime Afrique", "IA portuaire"), pas uniquement en cherchant deja le
// mot "COPAF".
//
// IMPORTANT : les 3 premiers articles ont ete rediges par Claude (IA) a
// partir de connaissances generales et publiques du secteur portuaire
// (normes, organismes, technologies reconnues) — AUCUN chiffre, evenement
// ou citation specifique n'est invente. A relire et valider par l'equipe
// COPAF avant toute publication ou diffusion presse officielle.
//
// Le communique "visite-travail-casablanca-..." est different : contenu
// officiel fourni tel quel par l'equipe COPAF (transcrit depuis leur
// document Word), pas redige par l'IA — pret pour diffusion.
//
// Chaque `content` est une liste de blocs { type: 'p' | 'h2', text }.
// `twoColumn: true` (optionnel) affiche le corps de l'article sur 2
// colonnes façon presse ecrite (voir ActualiteDetail.jsx).

export const ARTICLES = [
  {
    slug: 'cybersecurite-maritime-afrique',
    title: 'Cybersécurité maritime en Afrique : quels enjeux pour les ports du continent ?',
    metaDescription: "La digitalisation des ports africains ouvre de nouveaux risques cyber. Panorama des menaces, des normes existantes (Code ISPS, ISO 27001) et des priorités pour les autorités portuaires du continent.",
    excerpt: "À mesure que les ports africains se digitalisent, la cybersécurité devient un enjeu de souveraineté et de continuité d'activité aussi critique que la sûreté physique.",
    imageUrl: '/hero5.png',
    publishedDate: '2026-08-10',
    readingTime: 6,
    content: [
      { type: 'p', text: "Pendant longtemps, la sûreté portuaire en Afrique s'est essentiellement pensée en termes physiques : contrôle d'accès, vidéosurveillance, conformité au Code international pour la sûreté des navires et des installations portuaires (Code ISPS), entré en vigueur en 2004 sous l'égide de l'Organisation maritime internationale (OMI). Cette dimension reste centrale. Mais elle ne suffit plus. À mesure que les ports du continent adoptent des systèmes de gestion de terminaux (TOS), des guichets uniques portuaires, des plateformes d'échange de données EDI ou des capteurs connectés sur leurs équipements de manutention, ils héritent aussi des vulnérabilités propres à tout système numérique interconnecté." },
      { type: 'h2', text: "Un secteur structurellement exposé" },
      { type: 'p', text: "Un port moderne n'est pas un système isolé : il connecte des douanes, des transporteurs, des transitaires, des banques et des armateurs autour d'un même flux d'informations. Cette interconnexion, qui fait la valeur du guichet unique portuaire, est aussi ce qui multiplie les points d'entrée potentiels pour un incident de sécurité informatique. Un système de gestion de terminal (TOS) compromis, une base de données de suivi de conteneurs indisponible ou un système de facturation portuaire paralysé peuvent immobiliser des opérations bien au-delà du strict périmètre informatique — avec des conséquences directes sur les délais de dédouanement, la rotation des navires et la confiance des chargeurs internationaux." },
      { type: 'p', text: "Le secteur maritime mondial a d'ailleurs pris la mesure de ce risque : l'OMI a introduit en 2017 des lignes directrices sur la gestion des cyber-risques maritimes, intégrées depuis au Code international de gestion de la sécurité (ISM Code). Pour les autorités portuaires africaines, l'enjeu n'est donc plus seulement de se digitaliser, mais de le faire selon des standards de sécurité reconnus dès la conception — plutôt que d'ajouter la cybersécurité après coup, une fois l'incident survenu." },
      { type: 'h2', text: "Des référentiels existants, encore inégalement adoptés" },
      { type: 'p', text: "Les outils normatifs ne manquent pas. La norme ISO/IEC 27001 encadre la mise en place d'un système de management de la sécurité de l'information, applicable à toute organisation portuaire souhaitant structurer sa gouvernance cyber plutôt que d'empiler des mesures ponctuelles. La norme ISO 28000, spécifique aux chaînes d'approvisionnement, complète cette approche côté sûreté logistique. Des standards d'échange de données comme l'EDI/UN-EDIFACT, lorsqu'ils sont correctement mis en œuvre, réduisent aussi la surface de risque en évitant la multiplication de canaux de communication non sécurisés (email, fichiers partagés) pour des informations commerciales sensibles." },
      { type: 'p', text: "La difficulté, pour de nombreux ports africains de taille moyenne, n'est donc pas l'absence de référentiels, mais la capacité à les mettre en œuvre avec des ressources humaines et budgétaires souvent limitées. Un audit de sécurité initial, une politique de mots de passe individuels, une authentification à deux facteurs sur les systèmes critiques ou un plan de continuité d'activité documenté constituent des premières étapes accessibles, bien avant d'envisager une certification complète." },
      { type: 'h2', text: "La cybersécurité, un sujet de coopération régionale" },
      { type: 'p', text: "Parce que les chaînes logistiques portuaires sont par nature régionales — un même navire, une même cargaison, transitant par plusieurs ports du continent — la cybersécurité maritime africaine gagne à se penser collectivement. Le partage de bonnes pratiques entre autorités portuaires, la mutualisation de compétences rares (analystes sécurité, auditeurs certifiés) et l'alignement progressif sur des standards communs sont autant de leviers pour qu'aucun port ne devienne, par défaut, le maillon faible de la chaîne régionale. C'est précisément ce type d'échange entre pairs — techniciens, directeurs de port, experts en sécurité — que des rencontres sectorielles comme la Conférence des Ports Africains (COPAF) cherchent à organiser, en réunissant les autorités portuaires du continent autour de ces enjeux communs." },
    ],
  },
  {
    slug: 'ia-performance-portuaire-afrique',
    title: "Intelligence artificielle et performance portuaire : où en sont les ports africains ?",
    metaDescription: "De la prévision d'arrivée des navires à la maintenance prédictive des grues, l'IA transforme la performance opérationnelle des ports. État des lieux et pistes concrètes pour les autorités portuaires africaines.",
    excerpt: "L'intelligence artificielle n'est plus un horizon lointain pour les ports : elle s'applique déjà, très concrètement, à la prévision, à l'automatisation et à la maintenance des installations portuaires.",
    imageUrl: '/hero3.png',
    publishedDate: '2026-08-12',
    readingTime: 6,
    content: [
      { type: 'p', text: "Quand on parle d'intelligence artificielle appliquée aux ports, l'imaginaire va souvent vers des terminaux entièrement automatisés, à la manière de certains grands hubs asiatiques ou européens. Cette vision, coûteuse et lointaine pour la majorité des ports africains, masque une réalité plus immédiate : l'IA se déploie aujourd'hui surtout par petites briques ciblées, à fort retour sur investissement, plutôt que par une transformation totale d'un seul coup." },
      { type: 'h2', text: "Trois familles d'usages déjà matures" },
      { type: 'p', text: "La première famille d'usages concerne la prévision opérationnelle : estimer plus finement l'heure d'arrivée d'un navire (ETA), anticiper les pics de congestion sur un terminal ou optimiser l'allocation des postes à quai en fonction de l'historique de trafic. Ces modèles prédictifs, entraînés sur les données déjà collectées par la plupart des systèmes de gestion de terminal, ne nécessitent pas de nouvelle infrastructure lourde — seulement une volonté d'exploiter des données existantes plutôt que de continuer à planifier sur la seule expérience humaine." },
      { type: 'p', text: "La deuxième famille concerne la maintenance prédictive des équipements — portiques, grues, engins de manutention. Des capteurs IoT installés sur un nombre limité d'équipements pilotes permettent de détecter des signaux faibles d'usure avant la panne, réduisant les arrêts non planifiés qui coûtent le plus cher en temps d'immobilisation. C'est souvent la porte d'entrée la plus concrète vers l'automatisation pour un port qui n'a pas encore de jumeau numérique complet de ses installations." },
      { type: 'p', text: "La troisième famille, plus émergente sur le continent, touche à la sûreté et à la détection d'anomalies : analyse vidéo automatisée pour repérer des comportements inhabituels, détection d'anomalies dans les manifestes de cargaison, ou croisement de données pour identifier des incohérences documentaires. Ces usages renforcent la sûreté opérationnelle sans se substituer aux dispositifs humains existants, en les aidant à concentrer leur attention là où le risque est statistiquement le plus élevé." },
      { type: 'h2', text: "Le prérequis souvent sous-estimé : la donnée elle-même" },
      { type: 'p', text: "Aucun de ces usages ne fonctionne sans une donnée de base fiable et structurée. Un port qui souhaite déployer un modèle de prévision d'arrivée doit d'abord disposer d'un historique de mouvements de navires exploitable ; un port qui veut faire de la maintenance prédictive doit d'abord instrumenter ses équipements. L'intelligence artificielle n'est donc jamais le premier chantier d'un port en transformation digitale : elle vient après — et amplifie — les investissements déjà faits dans l'infrastructure numérique de base (guichet unique, traçabilité, connectivité)." },
      { type: 'h2', text: "Une opportunité de rattrapage, pas seulement de rattrapage technologique" },
      { type: 'p', text: "Pour de nombreux ports africains, la bonne nouvelle est que ces technologies sont aujourd'hui accessibles sous forme de solutions modulaires, sans nécessiter les investissements massifs des plus grands hubs mondiaux. Un port de taille moyenne peut légitimement viser, en douze à dix-huit mois, un premier cas d'usage IA mesurable — une fonction de prévision sur son processus le plus critique, ou un pilote de maintenance prédictive sur deux ou trois équipements — avant d'envisager une extension plus large. C'est cette logique de progression par étapes, plutôt que de saut technologique unique, que la conférence COPAF 2026 met justement au cœur de ses échanges entre directions portuaires africaines, sous le thème « Smart Port Africain : IA et cybersécurité au service de la performance »." },
    ],
  },
  {
    slug: 'copaf-2026-conference-ports-africains-ia-cybersecurite',
    title: 'COPAF 2026 réunit les ports africains autour de l\'intelligence artificielle et de la cybersécurité, à Casablanca',
    metaDescription: "Du 15 au 17 septembre 2026 à Casablanca, la Conférence des Ports Africains (COPAF 2026) rassemble dirigeants portuaires, experts et partenaires autour du thème « Smart Port Africain : IA et cybersécurité au service de la performance ».",
    excerpt: "Communiqué — La Conférence des Ports Africains (COPAF 2026) se tiendra du 15 au 17 septembre 2026 à Casablanca, autour de la transformation digitale et de la cybersécurité des ports du continent.",
    imageUrl: '/hero1.png',
    publishedDate: '2026-08-15',
    readingTime: 4,
    content: [
      { type: 'p', text: "Casablanca accueillera, du 15 au 17 septembre 2026, la Conférence des Ports Africains (COPAF 2026), un rendez-vous consacré à la transformation digitale du secteur portuaire africain. Organisée par CRF Perfection en partenariat avec l'AGPAOC (Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre) et l'ANP/UAPNA, cette édition a pour thème « Smart Port Africain : Intelligence Artificielle et cybersécurité au service de la performance »." },
      { type: 'h2', text: "Trois jours, entre réflexion stratégique et immersion terrain" },
      { type: 'p', text: "Le programme s'articule autour de trois journées thématiques. La première pose le cadre général de la « vision Smart Port africain », avec des plénières et panels consacrés au rôle de l'intelligence artificielle dans la modernisation des opérations portuaires. La deuxième journée se concentre sur l'excellence opérationnelle, la sécurité et la cybersécurité, avec des ateliers dédiés à la protection des systèmes portuaires connectés face aux menaces informatiques. La troisième journée propose une immersion terrain, avec une visite du Port de Casablanca et de ses infrastructures technologiques, portée par les équipes de l'Agence Nationale des Ports (ANP) et de l'UAPNA." },
      { type: 'h2', text: "Un espace d'échange entre dirigeants portuaires et experts sectoriels" },
      { type: 'p', text: "La conférence réunit des directeurs généraux d'autorités portuaires, des experts en cybersécurité et en intelligence artificielle appliquée au secteur maritime, ainsi que des partenaires technologiques du secteur. Les échanges portent notamment sur des cas concrets : diagnostic de maturité digitale des autorités portuaires, automatisation des opérations grâce à l'intelligence artificielle, gouvernance de la donnée, et protection des infrastructures portuaires connectées contre les menaces informatiques." },
      { type: 'p', text: "Les organisations portuaires intéressées peuvent obtenir plus d'informations et s'inscrire sur copaf-ports.com." },
    ],
  },
  {
    slug: 'visite-travail-casablanca-dg-crf-perfection-anp',
    title: "Conférence des Ports Africains (COPAF 2026) : le Directeur Général de CRF PERFECTION en visite de travail à Casablanca",
    metaDescription: "Le Dr William ODAH, DG de CRF PERFECTION, a été reçu le 12 août 2026 par l'Agence Nationale des Ports (ANP) à Casablanca pour préparer la COPAF 2026, dont la 3e journée sera désormais entièrement consacrée à la visite du Port de Casablanca.",
    excerpt: "Communiqué — Reçu par l'ANP à Casablanca le 12 août 2026, le Directeur Général de CRF PERFECTION a fait le point sur les préparatifs de la COPAF 2026, avec une décision clé : la 3e journée sera entièrement dédiée à la visite du Port de Casablanca.",
    imageUrl: '/hero4.png',
    publishedDate: '2026-08-12',
    readingTime: 5,
    twoColumn: true,
    content: [
      { type: 'p', text: "Dans le cadre des préparatifs de la Conférence des Ports Africains (COPAF 2026), le Directeur Général du Cabinet CRF PERFECTION, Dr William ODAH, a effectué une visite de travail à Casablanca, au Royaume du Maroc, où il a été reçu ce mercredi 12 août 2026 à la salle communautaire du Port de Casablanca par une équipe de l'Agence Nationale des Ports (ANP)." },
      { type: 'p', text: "La délégation marocaine était composée de M. Abdellatif LHOUAOUI, Directeur de la Communication et Relations Institutionnelles, de M. Abdelaziz FROUNI, Chef du Département Support, et de M. Ait Ali ABDERRAHIM, Chef du Département Infrastructures." },
      { type: 'p', text: "Cette rencontre s'inscrit dans le cadre de la préparation de la prochaine édition de la Conférence des Ports Africains, qui se tiendra du 15 au 17 septembre 2026 à Casablanca, autour du thème « Smart Port Africain : IA et Cybersécurité au service de la performance »." },
      { type: 'h2', text: "Une rencontre consacrée aux préparatifs de la COPAF" },
      { type: 'p', text: "Les échanges ont essentiellement porté sur les dispositions pratiques liées à l'organisation de la conférence, ainsi que sur la mobilisation des représentants de l'ANP et des ports membres de l'UAPNA." },
      { type: 'p', text: "Cette rencontre intervient dans le prolongement des échanges engagés autour de la COPAF entre le Cabinet CRF PERFECTION, organisateur de la conférence, l'Association de Gestion des Ports de l'Afrique de l'Ouest et du Centre (AGPAOC) et les différents acteurs portuaires marocains." },
      { type: 'p', text: "À l'occasion de cette séance de travail, le Directeur Général de CRF PERFECTION a présenté les ambitions de cette édition de la COPAF, son positionnement ainsi que les principales articulations du programme." },
      { type: 'p', text: "Les échanges ont également permis d'examiner les différentes dispositions nécessaires à l'accueil des participants et au bon déroulement des trois journées de la conférence." },
      { type: 'h2', text: "Une rencontre placée sous le signe de la coopération portuaire" },
      { type: 'p', text: "La rencontre a été aussi l'occasion de discuter des différentes perspectives de collaboration autour de cette initiative dédiée à la transformation et à la performance des ports africains." },
      { type: 'p', text: "Cette rencontre a également permis d'aborder les conditions de participation des acteurs portuaires marocains et africains à cette importante rencontre, ainsi que les différentes possibilités de renforcer les échanges entre les institutions et organisations engagées dans le développement du secteur portuaire africain." },
      { type: 'p', text: "Les discussions ont par ailleurs porté sur le programme de la conférence, avec notamment la volonté de renforcer sa dimension pratique et de favoriser l'immersion des participants dans l'environnement portuaire marocain." },
      { type: 'h2', text: "Une troisième journée entièrement consacrée au Port de Casablanca" },
      { type: 'p', text: "L'une des principales décisions issues de cette rencontre concerne le réaménagement du programme de la conférence." },
      { type: 'p', text: "À la demande de la partie marocaine, la troisième journée de la COPAF sera entièrement consacrée à une visite des infrastructures et installations portuaires du Port de Casablanca." },
      { type: 'p', text: "Cette immersion permettra aux participants de découvrir, sur le terrain, certaines solutions et pratiques liées à la digitalisation, à l'innovation et à la transformation des opérations portuaires." },
      { type: 'p', text: "Ce choix vient renforcer l'approche pratique de la COPAF, qui ne se veut pas uniquement un espace de conférences et de débats, mais également un cadre permettant aux participants de voir, comprendre et partager des expériences concrètes." },
      { type: 'h2', text: "Une dynamique africaine autour du Smart Port" },
      { type: 'p', text: "La COPAF 2026 entend ainsi réunir à Casablanca des décideurs, autorités portuaires, administrations maritimes, opérateurs logistiques, experts et acteurs technologiques autour des grandes transformations qui façonnent aujourd'hui le secteur portuaire africain." },
      { type: 'p', text: "L'intelligence artificielle, la cybersécurité, la digitalisation des opérations, la gouvernance de la donnée et l'innovation constituent autant de leviers qui seront au cœur des échanges." },
      { type: 'p', text: "À travers cette édition, la COPAF ambitionne de favoriser le partage d'expériences, la mise en réseau des acteurs et l'émergence de nouvelles collaborations entre les ports africains." },
      { type: 'h2', text: "Une étape importante dans la préparation de la COPAF 2026" },
      { type: 'p', text: "Cette mission de travail à Casablanca constitue une étape importante dans le processus de préparation de la COPAF 2026. Elle témoigne également de la volonté du Cabinet CRF PERFECTION de construire cette rencontre avec les institutions et acteurs directement concernés par l'avenir du secteur portuaire africain." },
      { type: 'p', text: "Les travaux de préparation se poursuivent désormais avec la finalisation des dispositions techniques, logistiques et scientifiques, ainsi que la mobilisation des différents participants et intervenants attendus à Casablanca." },
      { type: 'p', text: "Rendez-vous est donc pris les 15, 16 et 17 septembre 2026 à Casablanca pour trois journées consacrées à l'avenir du Smart Port africain." },
    ],
  },
]

export function getArticleBySlug(slug) {
  return ARTICLES.find(a => a.slug === slug) || null
}
