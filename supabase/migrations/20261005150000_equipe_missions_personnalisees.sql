-- Missions et plannings personnalisés des trois membres de l'accueil (Fatima, Wiame, Mohamed).
-- Tout est modifiable dans l'admin (onglet Équipe) : rôle, missions (puces), planning ligne par ligne.
-- Aucun texte provisoire entre crochets : les infos manquantes sont masquées ou formulées de façon neutre.
alter table public.equipe_membres add column if not exists missions text[] not null default '{}';

-- Champs communs aux trois fiches
update public.equipe_membres set
  equipe = 'Comité d''organisation',
  dates_mission = 'Du 17 au 22 octobre 2026',
  responsables = '[
    {"nom": "Yvette FANOU", "role": "accueil", "tel": "+229 61 74 42 42", "whatsapp": "+229 61 74 42 42"},
    {"nom": "Rénato TCHOBO", "role": "technique", "tel": "", "whatsapp": "+229 69 02 43 49"}
  ]'::jsonb,
  tenue = 'Tenue professionnelle aux couleurs COPAF : bleu marine {#00367F} et bleu ciel {#1798F4}',
  badge_info = 'Remis à l''hôtel à l''arrivée du 18 octobre. À porter visible en permanence.',
  rdv_lieu = 'Hôtel',
  rdv_detail = 'hall d''accueil',
  rdv_lien = null,
  horaire_arrivee = null,
  prochaine_etape = null,        -- vide : l'encadré prend la prochaine ligne du planning
  probleme_contact = null,       -- à renseigner : numéro de la coordination
  probleme_horaires = null,
  consignes = array[
    'Arriver 30 minutes avant le début de chaque journée.',
    'Toute question sans réponse est transmise à la coordination, sans improviser.',
    'Aucune information sur les paiements, les tarifs ou le statut des ports.',
    'Photos et publications sur les réseaux sociaux uniquement si elles sont validées par la DCM.'
  ]::text[]
where dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');

-- Rôles et missions
update public.equipe_membres set
  role = 'Accueil et relations avec les délégations',
  missions = array[
    'Accueillir les délégations à l''aéroport, à l''hôtel et en salle.',
    'Être l''interlocutrice des délégués pour leurs questions pratiques.',
    'Remettre les badges.',
    'Orienter les délégations pendant la conférence et la visite du port.'
  ]::text[]
where dossier = 'INT2026-010';

update public.equipe_membres set
  role = 'Logistique et coordination',
  missions = array[
    'Organiser les transferts aéroport ↔ hôtel (arrivées les 17 et 18, départs le 22).',
    'Marquer les places par personne ou par délégation en salle.',
    'Suivre le planning de chaque journée et alerter la coordination en cas de décalage.',
    'Veiller à la fluidité des déplacements entre l''hôtel et le lieu de la conférence.'
  ]::text[]
where dossier = 'INT2026-011';

update public.equipe_membres set
  role = 'Technique et régie',
  missions = array[
    'Appuyer Eliram et Rénato sur la technique en salle.',
    'Préparer et remettre les tablettes, dépanner les participants.',
    'Assurer l''émargement et le suivi de présence avec les tablettes de régie (page de scan).',
    'Veiller à la connexion et au matériel pendant les sessions.'
  ]::text[]
where dossier = 'INT2026-012';

-- Planning : lignes communes puis lignes propres à chaque personne
delete from public.equipe_planning p
using public.equipe_membres m
where p.membre_id = m.id and m.dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');

insert into public.equipe_planning (membre_id, jour, horaire, tache, lieu, ordre)
select m.id, v.jour::date, v.horaire, v.tache, v.lieu, v.ordre
from public.equipe_membres m
join (
  -- Communes aux trois
  select d.dossier, c.jour, c.horaire, c.tache, c.lieu, c.ordre
  from unnest(array['INT2026-010', 'INT2026-011', 'INT2026-012']) as d(dossier)
  cross join (values
    ('2026-10-13', 'Soir', 'Appel de coordination avec Yvette et Rénato', 'Lien communiqué par la coordination', 1),
    ('2026-10-19', '07h30', 'Arrivée de l''équipe : briefing et émargement à 08h00', 'Salle de conférence', 1),
    ('2026-10-19', '09h00', 'Ouverture de la conférence', 'Salle de conférence', 2),
    ('2026-10-20', '07h30', 'Arrivée de l''équipe : briefing et émargement à 08h00', 'Salle de conférence', 1),
    ('2026-10-20', 'Fin de journée', 'Clôture « Feuille de route » et remise des attestations', 'Salle de conférence', 9)
  ) as c(jour, horaire, tache, lieu, ordre)
  union all
  -- Fatima Es-bia : accueil et relations avec les délégations
  select 'INT2026-010', * from (values
    ('2026-10-17', 'Heure communiquée par la coordination', 'Accueil des intervenants à l''aéroport', 'Aéroport', 1),
    ('2026-10-18', 'Heure communiquée par la coordination', 'Accueil des participants à l''aéroport et à l''hôtel, remise des badges', 'Aéroport, puis hôtel', 1),
    ('2026-10-19', 'Journée', 'Accueil en salle et relations avec les délégations', 'Salle de conférence', 5),
    ('2026-10-20', 'Journée', 'Accueil en salle et relations avec les délégations', 'Salle de conférence', 5),
    ('2026-10-21', 'Journée', 'Accompagnement des délégations à la visite du Port de Casablanca (seule personne de l''accueil sur le terrain)', 'Port de Casablanca', 1),
    ('2026-10-22', 'Journée', 'Départs', 'Hôtel, puis aéroport', 1)
  ) as f(jour, horaire, tache, lieu, ordre)
  union all
  -- Wiame Lagha : logistique et coordination
  select 'INT2026-011', * from (values
    ('2026-10-17', 'Heure communiquée par la coordination', 'Transferts aéroport → hôtel des intervenants', 'Aéroport, puis hôtel', 1),
    ('2026-10-18', 'Heure communiquée par la coordination', 'Transferts des participants aéroport → hôtel', 'Aéroport, puis hôtel', 1),
    ('2026-10-19', 'Journée', 'Marquage des places, suivi du planning de la journée, navettes hôtel ↔ conférence', 'Hôtel et salle de conférence', 5),
    ('2026-10-20', 'Journée', 'Marquage des places, suivi du planning de la journée, navettes hôtel ↔ conférence', 'Hôtel et salle de conférence', 5),
    ('2026-10-21', 'Journée', 'Selon affectation', null, 1),
    ('2026-10-22', 'Heure communiquée par la coordination', 'Transferts des participants hôtel → aéroport', 'Hôtel, puis aéroport', 1)
  ) as w(jour, horaire, tache, lieu, ordre)
  union all
  -- Mohamed Haddad : technique et régie
  select 'INT2026-012', * from (values
    ('2026-10-17', 'Journée', 'Préparation de la salle et du matériel technique avec Eliram', 'Salle de conférence', 1),
    ('2026-10-18', 'Heure communiquée par la coordination', 'Remise des tablettes aux participants à l''hôtel (suivi sur /terrain)', 'Hôtel', 1),
    ('2026-10-19', 'Journée', 'Régie : émargement avec les tablettes, dépannage', 'Salle de conférence', 5),
    ('2026-10-20', 'Journée', 'Régie : émargement avec les tablettes, dépannage', 'Salle de conférence', 5),
    ('2026-10-21', 'Journée', 'Selon affectation', null, 1),
    ('2026-10-22', 'Journée', 'Récupération des tablettes et du matériel', 'Hôtel', 1)
  ) as h(jour, horaire, tache, lieu, ordre)
) as v on v.dossier = m.dossier;
