// Traductions anglaises des articles (voir articlesData.js). Chaque entree est
// indexee par le `slug` de l'article francais et reprend le meme decoupage en
// blocs `content` (meme ordre, memes types 'p' / 'h2'), pour que la version
// affichee suive la langue choisie dans le header.
//
// A relire par l'equipe COPAF avant diffusion presse officielle en anglais,
// au meme titre que les textes francais.

export const ARTICLES_EN = {
  'cybersecurite-maritime-afrique': {
    title: 'Maritime cybersecurity in Africa: what is at stake for the continent’s ports?',
    metaDescription: 'The digitalisation of African ports opens up new cyber risks. An overview of the threats, the existing standards (ISPS Code, ISO 27001) and the priorities for the continent’s port authorities.',
    excerpt: 'As African ports go digital, cybersecurity becomes an issue of sovereignty and business continuity as critical as physical security.',
    content: [
      { type: 'p', text: 'For a long time, port security in Africa was thought of mainly in physical terms: access control, video surveillance, compliance with the International Ship and Port Facility Security (ISPS) Code, which came into force in 2004 under the aegis of the International Maritime Organization (IMO). This dimension remains central, but it is no longer enough. As the continent’s ports adopt terminal operating systems (TOS), port single windows, EDI data-exchange platforms or connected sensors on their handling equipment, they also inherit the vulnerabilities of any interconnected digital system.' },
      { type: 'h2', text: 'A structurally exposed sector' },
      { type: 'p', text: 'A modern port is not an isolated system: it connects customs, carriers, freight forwarders, banks and shipowners around a single flow of information. This interconnection, which gives the port single window its value, is also what multiplies the potential entry points for an IT security incident. A compromised terminal operating system (TOS), an unavailable container-tracking database or a paralysed port billing system can bring operations to a standstill well beyond the strict IT perimeter, with direct consequences for clearance times, vessel turnaround and the confidence of international shippers.' },
      { type: 'p', text: 'The global maritime sector has taken the measure of this risk: in 2017 the IMO introduced guidelines on maritime cyber risk management, since integrated into the International Safety Management (ISM) Code. For African port authorities, the challenge is therefore no longer just to go digital, but to do so according to recognised security standards from the design stage, rather than adding cybersecurity afterwards, once an incident has occurred.' },
      { type: 'h2', text: 'Existing frameworks, still unevenly adopted' },
      { type: 'p', text: 'There is no shortage of normative tools. The ISO/IEC 27001 standard governs the implementation of an information security management system, applicable to any port organisation wishing to structure its cyber governance rather than piling up one-off measures. ISO 28000, specific to supply chains, complements this approach on the logistics security side. Data-exchange standards such as EDI/UN-EDIFACT, when properly implemented, also reduce the risk surface by avoiding the proliferation of unsecured communication channels (email, shared files) for sensitive commercial information.' },
      { type: 'p', text: 'The difficulty for many medium-sized African ports is therefore not the absence of frameworks, but the ability to implement them with often limited human and budgetary resources. An initial security audit, a policy of individual passwords, two-factor authentication on critical systems or a documented business continuity plan are accessible first steps, well before considering full certification.' },
      { type: 'h2', text: 'Cybersecurity, a matter of regional cooperation' },
      { type: 'p', text: 'Because port supply chains are regional by nature, with the same ship and the same cargo transiting through several ports of the continent, African maritime cybersecurity benefits from being thought of collectively. Sharing good practices between port authorities, pooling scarce skills (security analysts, certified auditors) and gradually aligning on common standards are all levers to ensure that no port becomes, by default, the weak link in the regional chain. This is precisely the kind of peer exchange (technicians, port directors, security experts) that sector gatherings such as the African Ports Conference (COPAF) seek to organise, by bringing the continent’s port authorities together around these shared challenges.' },
    ],
  },

  'ia-performance-portuaire-afrique': {
    title: 'Artificial intelligence and port performance: where do African ports stand?',
    metaDescription: 'From forecasting vessel arrivals to predictive maintenance of cranes, AI is transforming the operational performance of ports. An overview and practical avenues for African port authorities.',
    excerpt: 'Artificial intelligence is no longer a distant horizon for ports: it is already being applied, very concretely, to the forecasting, automation and maintenance of port facilities.',
    content: [
      { type: 'p', text: 'When we talk about artificial intelligence applied to ports, the imagination often turns to fully automated terminals, like some of the large hubs in Asia or Europe. This vision, costly and remote for most African ports, hides a more immediate reality: today AI is being deployed mainly through small, targeted building blocks with a high return on investment, rather than through a total transformation all at once.' },
      { type: 'h2', text: 'Three families of uses that are already mature' },
      { type: 'p', text: 'The first family of uses concerns operational forecasting: estimating a vessel’s arrival time (ETA) more precisely, anticipating congestion peaks at a terminal, or optimising berth allocation based on traffic history. These predictive models, trained on the data already collected by most terminal operating systems, do not require new heavy infrastructure, only a willingness to exploit existing data rather than continuing to plan on human experience alone.' },
      { type: 'p', text: 'The second family concerns predictive maintenance of equipment: gantries, cranes, handling machinery. IoT sensors installed on a limited number of pilot machines make it possible to detect weak signs of wear before a breakdown, reducing the unplanned stoppages that cost the most in downtime. It is often the most concrete gateway to automation for a port that does not yet have a complete digital twin of its facilities.' },
      { type: 'p', text: 'The third family, more emerging on the continent, relates to security and anomaly detection: automated video analysis to spot unusual behaviour, detection of anomalies in cargo manifests, or cross-referencing of data to identify documentary inconsistencies. These uses strengthen operational security without replacing existing human arrangements, helping them concentrate their attention where the risk is statistically highest.' },
      { type: 'h2', text: 'The often underestimated prerequisite: the data itself' },
      { type: 'p', text: 'None of these uses works without reliable, structured base data. A port that wants to deploy an arrival forecasting model must first have a usable history of vessel movements; a port that wants to do predictive maintenance must first instrument its equipment. Artificial intelligence is therefore never the first project of a port undergoing digital transformation: it comes after, and amplifies, the investments already made in the basic digital infrastructure (single window, traceability, connectivity).' },
      { type: 'h2', text: 'An opportunity to catch up, not only technologically' },
      { type: 'p', text: 'For many African ports, the good news is that these technologies are now available as modular solutions, without requiring the massive investments of the world’s largest hubs. A medium-sized port can legitimately aim, within twelve to eighteen months, for a first measurable AI use case (a forecasting function on its most critical process, or a predictive maintenance pilot on two or three machines) before considering a broader extension. It is this logic of step-by-step progress, rather than a single technological leap, that the COPAF 2026 conference places at the heart of its exchanges between African port managements, under the theme “Smart African Port: AI and Cybersecurity for Performance”.' },
    ],
  },

  'copaf-2026-conference-ports-africains-ia-cybersecurite': {
    title: 'COPAF 2026 brings African ports together around artificial intelligence and cybersecurity, in Casablanca',
    metaDescription: 'From 19 to 21 October 2026 in Casablanca, the African Ports Conference (COPAF 2026) brings together port leaders, experts and partners around the theme “Smart African Port: AI and Cybersecurity for Performance”.',
    excerpt: 'Press release: the African Ports Conference (COPAF 2026) will be held from 19 to 21 October 2026 in Casablanca, focusing on the digital transformation and cybersecurity of the continent’s ports.',
    content: [
      { type: 'p', text: 'From 19 to 21 October 2026, Casablanca will host the African Ports Conference (COPAF 2026), an event dedicated to the digital transformation of the African port sector. Organised by CRF Perfection in partnership with AGPAOC (Association of Ports Management for West and Central Africa) and ANP/UAPNA, this edition has as its theme “Smart African Port: Artificial Intelligence and Cybersecurity for Performance”.' },
      { type: 'h2', text: 'Three days, between strategic reflection and field immersion' },
      { type: 'p', text: 'The programme is built around three thematic days. The first sets the general framework of the “vision of the African Smart Port”, with plenaries and panels on the role of artificial intelligence in modernising port operations. The second day focuses on operational excellence, security and cybersecurity, with workshops dedicated to protecting connected port systems against cyber threats. The third day offers a field immersion, with a visit to the Port of Casablanca and its technological infrastructure, led by the teams of the National Ports Agency (ANP) and UAPNA.' },
      { type: 'h2', text: 'A space for exchange between port leaders and industry experts' },
      { type: 'p', text: 'The conference brings together directors general of port authorities, experts in cybersecurity and in artificial intelligence applied to the maritime sector, as well as technology partners in the field. The discussions cover in particular concrete cases: digital maturity diagnosis of port authorities, automation of operations through artificial intelligence, data governance, and protection of connected port infrastructure against cyber threats.' },
      { type: 'p', text: 'Port organisations interested in taking part can find more information and register at copaf-ports.com.' },
    ],
  },

  'visite-travail-casablanca-dg-crf-perfection-anp': {
    title: 'African Ports Conference (COPAF 2026): the Director General of CRF PERFECTION on a working visit to Casablanca',
    metaDescription: 'Dr William ODAH, Director General of CRF PERFECTION, was received on 12 August 2026 by the National Ports Agency (ANP) in Casablanca to prepare COPAF 2026, whose third day will now be devoted entirely to a visit of the Port of Casablanca.',
    excerpt: 'Press release: received by the ANP in Casablanca on 12 August 2026, the Director General of CRF PERFECTION reviewed the preparations for COPAF 2026, with a key decision: the third day will be devoted entirely to a visit of the Port of Casablanca.',
    content: [
      { type: 'p', text: 'As part of the preparations for the African Ports Conference (COPAF 2026), the Director General of the firm CRF PERFECTION, Dr William ODAH, made a working visit to Casablanca, in the Kingdom of Morocco, where he was received on Wednesday 12 August 2026 at the community hall of the Port of Casablanca by a team from the National Ports Agency (ANP).' },
      { type: 'p', text: 'The Moroccan delegation was made up of Mr Abdellatif LHOUAOUI, Director of Communication and Institutional Relations, Mr Abdelaziz FROUNI, Head of the Support Department, and Mr Ait Ali ABDERRAHIM, Head of the Infrastructure Department.' },
      { type: 'p', text: 'This meeting is part of the preparation for the next edition of the African Ports Conference, which will be held from 19 to 21 October 2026 in Casablanca, under the theme “Smart African Port: AI and Cybersecurity for Performance”.' },
      { type: 'h2', text: 'A meeting devoted to the preparations for COPAF' },
      { type: 'p', text: 'The discussions focused mainly on the practical arrangements for organising the conference, as well as on the mobilisation of ANP representatives and of the member ports of UAPNA.' },
      { type: 'p', text: 'This meeting follows on from the discussions begun around COPAF between the firm CRF PERFECTION, organiser of the conference, the Association of Ports Management for West and Central Africa (AGPAOC) and the various Moroccan port stakeholders.' },
      { type: 'p', text: 'During this working session, the Director General of CRF PERFECTION presented the ambitions of this edition of COPAF, its positioning and the main components of the programme.' },
      { type: 'p', text: 'The discussions also made it possible to review the various arrangements needed to welcome participants and ensure the smooth running of the three days of the conference.' },
      { type: 'h2', text: 'A meeting held in the spirit of port cooperation' },
      { type: 'p', text: 'The meeting was also an opportunity to discuss the various prospects for collaboration around this initiative dedicated to the transformation and performance of African ports.' },
      { type: 'p', text: 'This meeting also made it possible to address the conditions for the participation of Moroccan and African port stakeholders in this important gathering, as well as the various possibilities for strengthening exchanges between the institutions and organisations committed to the development of the African port sector.' },
      { type: 'p', text: 'The discussions also covered the conference programme, in particular the desire to strengthen its practical dimension and to encourage participants’ immersion in the Moroccan port environment.' },
      { type: 'h2', text: 'A third day devoted entirely to the Port of Casablanca' },
      { type: 'p', text: 'One of the main decisions to come out of this meeting concerns the rearrangement of the conference programme.' },
      { type: 'p', text: 'At the request of the Moroccan side, the third day of COPAF will be devoted entirely to a visit of the infrastructure and port facilities of the Port of Casablanca.' },
      { type: 'p', text: 'This immersion will allow participants to discover, on the ground, certain solutions and practices related to the digitalisation, innovation and transformation of port operations.' },
      { type: 'p', text: 'This choice reinforces the practical approach of COPAF, which is not meant to be only a space for conferences and debates, but also a setting that allows participants to see, understand and share concrete experiences.' },
      { type: 'h2', text: 'An African momentum around the Smart Port' },
      { type: 'p', text: 'COPAF 2026 thus intends to bring together in Casablanca decision-makers, port authorities, maritime administrations, logistics operators, experts and technology players around the major transformations shaping the African port sector today.' },
      { type: 'p', text: 'Artificial intelligence, cybersecurity, the digitalisation of operations, data governance and innovation are all levers that will be at the heart of the discussions.' },
      { type: 'p', text: 'Through this edition, COPAF aims to encourage the sharing of experience, the networking of stakeholders and the emergence of new collaborations between African ports.' },
      { type: 'h2', text: 'An important step in the preparation of COPAF 2026' },
      { type: 'p', text: 'This working mission to Casablanca is an important step in the preparation process of COPAF 2026. It also reflects the firm CRF PERFECTION’s wish to build this gathering with the institutions and stakeholders directly concerned by the future of the African port sector.' },
      { type: 'p', text: 'Preparatory work now continues with the finalisation of the technical, logistical and scientific arrangements, as well as the mobilisation of the various participants and speakers expected in Casablanca.' },
      { type: 'p', text: 'See you on 19, 20 and 21 October 2026 in Casablanca for three days devoted to the future of the African Smart Port.' },
    ],
  },
}
