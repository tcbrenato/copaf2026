// src/utils/lettreMissionPresets.js
//
// Pre-remplissage rapide du formulaire "Lettre de mission" (Admin) pour les
// personnes recurrentes de l'equipe/comite, et un modele de texte pour les
// intervenants exterieurs (attributions generees a partir du titre/date/
// heure de leur session). Point de depart modifiable, jamais un verrou :
// tous les champs restent editables apres selection d'un preset.

export const PRESETS_LETTRE_MISSION = [
  {
    id: 'odah',
    dossier: 'INT2026-001',
    nom: 'Dr Oloutayo William ODAH',
    fonction: 'Directeur Général, CRF Perfection',
    organisation: 'CRF Perfection',
    qualite: 'comite',
    attributions: "Direction générale de la conférence, représentation institutionnelle auprès des autorités portuaires et des partenaires, présidence des sessions d'ouverture et de clôture.",
  },
  {
    id: 'taofic',
    dossier: 'INT2026-007',
    nom: 'Taofic [NOM À COMPLÉTER]',
    fonction: 'Assistant du Directeur Général',
    organisation: 'CRF Perfection',
    qualite: 'comite',
    attributions: "Assistance à la Direction générale, coordination de l'agenda et du protocole, liaison avec les délégations et les partenaires institutionnels.",
  },
  {
    id: 'renato',
    dossier: 'INT2026-002',
    nom: 'Rénato TCHOBO',
    fonction: 'Directeur Numérique & IT',
    organisation: 'CRF Perfection',
    qualite: 'equipe',
    attributions: "Direction de la régie technique et numérique : gestion de la plateforme copaf-ports.com, accréditations et badges, diffusion en direct, configuration des tablettes et supports de présentation.",
  },
  {
    id: 'yvette',
    dossier: 'INT2026-008',
    nom: 'Yvette FANOU',
    fonction: 'Directrice Commerciale et Marketing (DCM)',
    organisation: 'CRF Perfection',
    qualite: 'equipe',
    attributions: "Coordination commerciale et relations partenaires : accueil des sponsors et exposants, suivi des délégations, appui à la communication de l'événement.",
  },
  {
    id: 'eliram',
    dossier: 'INT2026-009',
    nom: 'Eliram [NOM À COMPLÉTER]',
    fonction: 'Assistant technique',
    organisation: 'CRF Perfection',
    qualite: 'equipe',
    attributions: "Assistance technique à la régie : installation et exploitation du matériel audiovisuel, captation vidéo, appui à la diffusion en direct et au contrôle d'accès.",
  },
  {
    id: 'alida',
    nom: 'Alida [NOM À COMPLÉTER]',
    fonction: 'Assistante du cabinet',
    organisation: 'CRF Perfection',
    qualite: 'equipe',
    attributions: "Appui administratif et logistique : accueil et enregistrement des participants, gestion des documents, assistance au secrétariat de la conférence.",
  },
  {
    id: 'balsomi',
    dossier: 'INT2026-005',
    nom: 'Dr Babel BALSOMI',
    fonction: 'Experte en cybersécurité',
    organisation: '[ORGANISATION À COMPLÉTER]',
    qualite: 'intervenant',
    attributions: "Intervention en qualité d'experte lors de la table ronde « Automatisation des opérations portuaires par l'IA et gouvernance de la donnée » (Jour 1) et animation de l'atelier « Cybersécurité portuaire » (Jour 2).",
  },
]

export const MODELE_INTERVENANT =
  "Intervention en qualité d'expert(e) lors de la session « {titre} », prévue le {date} à {heure}."
