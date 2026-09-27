-- Permet au facilitateur de retenir la revelation des resultats (radar,
-- analyses, recommandations) en session live : une fois les 10 dimensions
-- repondues, le diagnostic est deja enregistre en base, mais le participant
-- reste sur un ecran d'attente (carte de l'Afrique) jusqu'a ce que l'admin
-- "donne le top" en debloquant les resultats pour tout le monde d'un coup.
-- N'a aucun effet hors session live (session_active = false) : le parcours
-- en libre-service reste inchange, resultat instantane.
alter table public.diagnostic_session add column resultats_debloques boolean not null default false;
