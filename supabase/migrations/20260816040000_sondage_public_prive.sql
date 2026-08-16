-- Mode public/prive pour les sondages en direct.
--
-- Public  : le votant renseigne nom + port au moment de voter, et l'ecran
--           de resultats (/sondage-live/:id) affiche qui a repondu quoi.
-- Prive   : comportement actuel inchange, vote totalement anonyme.
--
-- Aucune modification RLS necessaire : public.sondages et public.votes ont
-- deja des policies de lecture/ecriture publiques (creees directement dans
-- le dashboard Supabase, anterieures au suivi des migrations dans ce repo) ;
-- RLS s'applique par ligne, pas par colonne, donc les nouvelles colonnes
-- nullables ci-dessous heritent automatiquement des memes droits.

alter table public.sondages add column if not exists is_public boolean not null default false;
alter table public.votes    add column if not exists nom  text;
alter table public.votes    add column if not exists port text;
