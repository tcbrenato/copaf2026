-- Fatima, Wiame, Mohamed (accueil et assistance) : mission du 17 au 22 octobre, planning simplifié (où être, quoi faire),
-- arrivée à 07h30 les jours 1 et 2 (briefing à 08h00, consigne des 30 minutes d'avance). Le détail des sessions est
-- renvoyé vers le Programme (lien dans l'onglet « Mon planning »).
update public.equipe_membres set
  dates_mission = 'Du 17 au 22 octobre 2026',
  horaire_arrivee = 'Jours 1 et 2 : 07h30 (briefing à 08h00, ouverture à 09h00) · Jour 3 : voir « Mon planning »',
  prochaine_etape = 'Samedi 17 octobre, [heure], aéroport : arrivée des intervenants.'
where dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');

delete from public.equipe_planning p
using public.equipe_membres m
where p.membre_id = m.id and m.dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');

insert into public.equipe_planning (membre_id, jour, horaire, tache, lieu, ordre)
select m.id, v.jour::date, v.horaire, v.tache, v.lieu, v.ordre
from (values
  ('2026-10-13', 'Soir', 'Appel de coordination avec Yvette et Rénato', '[lien visio ou hôtel]', 1),
  ('2026-10-17', 'Journée', 'Accueil des intervenants à l''aéroport, accompagnement à l''hôtel', 'Aéroport', 1),
  ('2026-10-18', 'Journée', 'Accueil des participants, transfert, remise du badge et de la tablette', 'Aéroport, puis hôtel', 1),
  ('2026-10-19', '07h30', 'Briefing de l''équipe et émargement (à 08h00)', 'Salle de conférence', 1),
  ('2026-10-19', 'Journée', 'Ouverture à 09h00, puis accueil en salle et assistance toute la journée', 'Salle de conférence', 2),
  ('2026-10-20', '07h30', 'Briefing de l''équipe et émargement (à 08h00)', 'Salle de conférence', 1),
  ('2026-10-20', 'Journée', 'Accueil en salle et assistance, clôture et attestations en fin de journée', 'Salle de conférence', 2),
  ('2026-10-21', 'Journée', 'Accompagnement au Port', 'Port de Casablanca', 1),
  ('2026-10-22', 'Journée', 'Départs et transferts', 'Hôtel, puis aéroport', 1)
) as v(jour, horaire, tache, lieu, ordre)
cross join public.equipe_membres m
where m.dossier in ('INT2026-010', 'INT2026-011', 'INT2026-012');
