-- Retrait complet du "COPAF Smart Port Challenge" (demo tablette /demo).
-- Decision : la conference COPAF 2026 se deroule entierement en format
-- salle (plenieres, panels, ateliers, tables rondes) + visite terrain le
-- jour 3, sans stand d'exposition — un outil pense pour attirer du monde
-- sur un stand n'a donc pas d'usage ici. La Edge Function
-- smart-port-challenge-score a deja ete retiree via `supabase functions
-- delete`.

drop function if exists public.get_smart_port_challenge_top10();
drop table if exists public.copaf_demo_scores;
