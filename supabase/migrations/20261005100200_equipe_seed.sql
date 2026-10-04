-- Données initiales PROVISOIRES de l'Espace équipe (tout est modifiable depuis l'admin > Équipe).
-- Les mentions [à confirmer] signalent un contenu à valider. À exécuter après les deux migrations précédentes.

insert into public.equipe_membres
  (dossier, nom, email, email2, role, equipe, responsable_nom, responsable_tel, tenue, consignes, rdv_lieu, rdv_detail, ordre)
values
  ('INT2026-008', 'Yvette FANOU', 'lacoccinelle368@gmail.com', null, 'Coordination générale, accueil et relation avec les délégations', 'Direction de la communication et du marketing (DCM)', 'Dr William ODAH (DG)', null, 'Tenue professionnelle aux couleurs COPAF (bleu marine #00367F / bleu ciel #1798F4) [à confirmer]', array['Badge visible en permanence.', 'Arriver 30 minutes avant le début de chaque journée.', 'Toute question sans réponse est transmise à la coordination, sans improviser.', 'Aucune information sur les paiements, les tarifs ou le statut des ports.', 'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.']::text[], 'Hôtel', 'Hall d''accueil [à confirmer]', 1),
  ('INT2026-009', 'Eliram ODAH', 'eliramodahthegoat@gmail.com', null, 'Régie technique : tablettes, scan de présence, projection', 'Technique et numérique', 'Rénato TCHOBO', '+229 01 92 37 77 77', 'Tenue professionnelle aux couleurs COPAF (bleu marine #00367F / bleu ciel #1798F4) [à confirmer]', array['Badge visible en permanence.', 'Arriver 30 minutes avant le début de chaque journée.', 'Toute question sans réponse est transmise à la coordination, sans improviser.', 'Aucune information sur les paiements, les tarifs ou le statut des ports.', 'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.']::text[], 'Salle de conférence', 'Régie', 2),
  ('INT2026-010', 'Fatima Es-bia', 'fatimaesbia@gmail.com', null, 'Accueil et assistance des participants', 'Comité d''organisation', 'Yvette FANOU (accueil) · Rénato TCHOBO (technique)', null, 'Tenue professionnelle aux couleurs COPAF (bleu marine #00367F / bleu ciel #1798F4) [à confirmer]', array['Badge visible en permanence.', 'Arriver 30 minutes avant le début de chaque journée.', 'Toute question sans réponse est transmise à la coordination, sans improviser.', 'Aucune information sur les paiements, les tarifs ou le statut des ports.', 'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.']::text[], 'Hôtel', 'Hall d''accueil [à confirmer]', 3),
  ('INT2026-011', 'Wiame Lagha', 'w.lagha@mundiapolis.ma', 'Laghawiame9@gmail.com', 'Accueil et assistance des participants', 'Comité d''organisation', 'Yvette FANOU (accueil) · Rénato TCHOBO (technique)', null, 'Tenue professionnelle aux couleurs COPAF (bleu marine #00367F / bleu ciel #1798F4) [à confirmer]', array['Badge visible en permanence.', 'Arriver 30 minutes avant le début de chaque journée.', 'Toute question sans réponse est transmise à la coordination, sans improviser.', 'Aucune information sur les paiements, les tarifs ou le statut des ports.', 'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.']::text[], 'Hôtel', 'Hall d''accueil [à confirmer]', 4),
  ('INT2026-012', 'Mohamed Haddad', 'mhaddad.sec@gmail.com', null, 'Accueil et assistance des participants', 'Comité d''organisation', 'Yvette FANOU (accueil) · Rénato TCHOBO (technique)', null, 'Tenue professionnelle aux couleurs COPAF (bleu marine #00367F / bleu ciel #1798F4) [à confirmer]', array['Badge visible en permanence.', 'Arriver 30 minutes avant le début de chaque journée.', 'Toute question sans réponse est transmise à la coordination, sans improviser.', 'Aucune information sur les paiements, les tarifs ou le statut des ports.', 'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.']::text[], 'Hôtel', 'Hall d''accueil [à confirmer]', 5)
on conflict (dossier) do nothing;

-- Photo reprise de la fiche intervenant quand elle existe
update public.equipe_membres m set photo_url = i.photo_url
from public.intervenants i where i.dossier = m.dossier and m.photo_url is null;

-- Titre et biographie : Fatima Es-bia uniquement (les 4 autres restent vides)
update public.equipe_membres set
  titre = 'Jeune diplômée en Marketing & Communication',
  biographie = 'Diplômée du Master Grande École de l''ISCAE, spécialisation Marketing & Communication, avec une expérience récente chez INNOVX en Marketing & Sales Performance.
Mon parcours se situe à l''intersection du marketing stratégique, du business development et de l''analyse de marché, avec une exposition particulière aux projets industriels et aux enjeux de commercialisation de nouvelles activités. Mon expérience internationale à Beijing Foreign Studies University complète un parcours construit entre plusieurs environnements académiques et professionnels.'
where dossier = 'INT2026-010';

-- Planning
insert into public.equipe_planning (membre_id, jour, horaire, tache, lieu, ordre)
select m.id, v.jour::date, v.horaire, v.tache, v.lieu, v.ordre
from (values
  ('INT2026-008', '2026-10-13', 'Soir [à confirmer]', 'Arrivée à Casablanca avec Rénato, installation, appel de coordination avec Fatima, Wiame et Mohamed', 'Hôtel', 0),
  ('INT2026-010', '2026-10-13', 'Soir [à confirmer]', 'Appel de coordination avec Yvette et Rénato', 'Hôtel', 1),
  ('INT2026-011', '2026-10-13', 'Soir [à confirmer]', 'Appel de coordination avec Yvette et Rénato', 'Hôtel', 2),
  ('INT2026-012', '2026-10-13', 'Soir [à confirmer]', 'Appel de coordination avec Yvette et Rénato', 'Hôtel', 3),
  ('INT2026-008', '2026-10-14', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, achats manquants, repérage de la salle, impression des badges, PLV (coordination)', 'Hôtel / salle', 4),
  ('INT2026-009', '2026-10-14', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, repérage de la salle, installation de la régie', 'Hôtel / salle', 5),
  ('INT2026-008', '2026-10-15', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, achats manquants, repérage de la salle, impression des badges, PLV (coordination)', 'Hôtel / salle', 6),
  ('INT2026-009', '2026-10-15', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, repérage de la salle, installation de la régie', 'Hôtel / salle', 7),
  ('INT2026-008', '2026-10-16', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, achats manquants, repérage de la salle, impression des badges, PLV (coordination)', 'Hôtel / salle', 8),
  ('INT2026-009', '2026-10-16', '09h00–17h00 [à confirmer]', 'Réception et réglage des tablettes, repérage de la salle, installation de la régie', 'Hôtel / salle', 9),
  ('INT2026-008', '2026-10-17', 'Journée', 'Arrivée des intervenants : coordination de l’accueil aéroport et de l’installation', 'Aéroport / hôtel', 10),
  ('INT2026-009', '2026-10-17', 'Journée [à confirmer]', 'Préparation technique de la régie et des tablettes', 'Hôtel / salle', 11),
  ('INT2026-010', '2026-10-17', 'Journée', 'Arrivée des intervenants : installation, accueil aéroport', 'Aéroport', 12),
  ('INT2026-011', '2026-10-17', 'Journée', 'Arrivée des intervenants : installation, accueil aéroport', 'Aéroport', 13),
  ('INT2026-012', '2026-10-17', 'Journée', 'Arrivée des intervenants : installation, accueil aéroport', 'Aéroport', 14),
  ('INT2026-008', '2026-10-18', 'Journée', 'Accueil aéroport et transferts, remise des badges et tablettes à l’hôtel (suivi sur /terrain), accueil des délégations', 'Aéroport / hôtel', 15),
  ('INT2026-009', '2026-10-18', 'Journée [à confirmer]', 'Appui technique à la remise des tablettes à l’hôtel (suivi sur /terrain)', 'Hôtel', 16),
  ('INT2026-010', '2026-10-18', 'Journée', 'Accueil aéroport, transfert, remise du badge et de la tablette à l’hôtel (suivi sur /terrain)', 'Aéroport / hôtel', 17),
  ('INT2026-011', '2026-10-18', 'Journée', 'Accueil aéroport, transfert, remise du badge et de la tablette à l’hôtel (suivi sur /terrain)', 'Aéroport / hôtel', 18),
  ('INT2026-012', '2026-10-18', 'Journée', 'Accueil aéroport, transfert, remise du badge et de la tablette à l’hôtel (suivi sur /terrain)', 'Aéroport / hôtel', 19),
  ('INT2026-008', '2026-10-19', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 20),
  ('INT2026-009', '2026-10-19', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 21),
  ('INT2026-010', '2026-10-19', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 22),
  ('INT2026-011', '2026-10-19', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 23),
  ('INT2026-012', '2026-10-19', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 24),
  ('INT2026-008', '2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 25),
  ('INT2026-009', '2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 26),
  ('INT2026-010', '2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 27),
  ('INT2026-011', '2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 28),
  ('INT2026-012', '2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 29),
  ('INT2026-008', '2026-10-19', '10h15–17h00', 'Quatre sessions : IA et Smart Port, diagnostic de maturité digitale, projet technologique portuaire, gouvernance de la donnée (pauses café de 30 min, déjeuner de 1 h)', 'Salle de conférence', 30),
  ('INT2026-009', '2026-10-19', '10h15–17h00', 'Quatre sessions : IA et Smart Port, diagnostic de maturité digitale, projet technologique portuaire, gouvernance de la donnée (pauses café de 30 min, déjeuner de 1 h)', 'Salle de conférence', 31),
  ('INT2026-010', '2026-10-19', '10h15–17h00', 'Quatre sessions : IA et Smart Port, diagnostic de maturité digitale, projet technologique portuaire, gouvernance de la donnée (pauses café de 30 min, déjeuner de 1 h)', 'Salle de conférence', 32),
  ('INT2026-011', '2026-10-19', '10h15–17h00', 'Quatre sessions : IA et Smart Port, diagnostic de maturité digitale, projet technologique portuaire, gouvernance de la donnée (pauses café de 30 min, déjeuner de 1 h)', 'Salle de conférence', 33),
  ('INT2026-012', '2026-10-19', '10h15–17h00', 'Quatre sessions : IA et Smart Port, diagnostic de maturité digitale, projet technologique portuaire, gouvernance de la donnée (pauses café de 30 min, déjeuner de 1 h)', 'Salle de conférence', 34),
  ('INT2026-008', '2026-10-19', 'Toute la journée', 'Coordination générale et accueil des délégations', 'Salle de conférence', 35),
  ('INT2026-009', '2026-10-19', 'À chaque session', 'Régie : tablettes, scan de présence, projection', 'Régie', 36),
  ('INT2026-010', '2026-10-19', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 37),
  ('INT2026-011', '2026-10-19', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 38),
  ('INT2026-012', '2026-10-19', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 39),
  ('INT2026-008', '2026-10-20', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 40),
  ('INT2026-009', '2026-10-20', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 41),
  ('INT2026-010', '2026-10-20', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 42),
  ('INT2026-011', '2026-10-20', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 43),
  ('INT2026-012', '2026-10-20', '08h00', 'Briefing de l’équipe et émargement', 'Salle de conférence', 44),
  ('INT2026-008', '2026-10-20', '09h00–17h00', 'Opérations nautiques, sécurité et sûreté, cybersécurité (13h30–14h15), clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 45),
  ('INT2026-009', '2026-10-20', '09h00–17h00', 'Opérations nautiques, sécurité et sûreté, cybersécurité (13h30–14h15), clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 46),
  ('INT2026-010', '2026-10-20', '09h00–17h00', 'Opérations nautiques, sécurité et sûreté, cybersécurité (13h30–14h15), clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 47),
  ('INT2026-011', '2026-10-20', '09h00–17h00', 'Opérations nautiques, sécurité et sûreté, cybersécurité (13h30–14h15), clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 48),
  ('INT2026-012', '2026-10-20', '09h00–17h00', 'Opérations nautiques, sécurité et sûreté, cybersécurité (13h30–14h15), clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 49),
  ('INT2026-008', '2026-10-20', 'Toute la journée', 'Coordination générale et accueil des délégations', 'Salle de conférence', 50),
  ('INT2026-009', '2026-10-20', 'À chaque session', 'Régie : tablettes, scan de présence, projection', 'Régie', 51),
  ('INT2026-010', '2026-10-20', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 52),
  ('INT2026-011', '2026-10-20', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 53),
  ('INT2026-012', '2026-10-20', 'Toute la journée', 'Accueil en salle et assistance des participants', 'Salle de conférence', 54),
  ('INT2026-008', '2026-10-21', 'Horaire à fixer', 'Visite du Port de Casablanca, réseautage, photos de groupe', 'Port de Casablanca', 55),
  ('INT2026-009', '2026-10-21', 'Horaire à fixer', 'Visite du Port de Casablanca, réseautage, photos de groupe', 'Port de Casablanca', 56),
  ('INT2026-010', '2026-10-21', 'Horaire à fixer', 'Visite du Port de Casablanca, réseautage, photos de groupe', 'Port de Casablanca', 57),
  ('INT2026-011', '2026-10-21', 'Horaire à fixer', 'Visite du Port de Casablanca, réseautage, photos de groupe', 'Port de Casablanca', 58),
  ('INT2026-012', '2026-10-21', 'Horaire à fixer', 'Visite du Port de Casablanca, réseautage, photos de groupe', 'Port de Casablanca', 59),
  ('INT2026-008', '2026-10-21', 'Journée', 'Coordination de la visite et accueil des délégations', 'Port de Casablanca', 60),
  ('INT2026-010', '2026-10-21', 'Journée [à confirmer]', 'Une seule personne de l’accueil sur le terrain : attribution à confirmer', 'Port de Casablanca', 61),
  ('INT2026-011', '2026-10-21', 'Journée [à confirmer]', 'Une seule personne de l’accueil sur le terrain : attribution à confirmer', 'Port de Casablanca', 62),
  ('INT2026-012', '2026-10-21', 'Journée [à confirmer]', 'Une seule personne de l’accueil sur le terrain : attribution à confirmer', 'Port de Casablanca', 63),
  ('INT2026-008', '2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel / aéroport', 64),
  ('INT2026-009', '2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel / aéroport', 65),
  ('INT2026-010', '2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel / aéroport', 66),
  ('INT2026-011', '2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel / aéroport', 67),
  ('INT2026-012', '2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel / aéroport', 68),
  ('INT2026-009', '2026-10-22', 'Journée [à confirmer]', 'Retour des tablettes', 'Hôtel', 69)
) as v(dossier, jour, horaire, tache, lieu, ordre)
join public.equipe_membres m on m.dossier = v.dossier
where not exists (select 1 from public.equipe_planning);

-- Documents communs (URLs à saisir plus tard dans l'admin)
insert into public.equipe_documents (titre, type, url, ordre)
select * from (values
  ('Charte de l''équipe', 'charte', null::text, 1),
  ('COPAF_2026_Programme_Finalisé', 'programme', null, 2),
  ('Plan du site', 'plan', null, 3)
) as d(titre, type, url, ordre)
where not exists (select 1 from public.equipe_documents);
