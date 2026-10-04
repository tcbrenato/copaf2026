-- Titre professionnel et biographie (badge digital). Facultatifs, utilisables même si la table existe déjà.
alter table public.equipe_membres add column if not exists titre text;
alter table public.equipe_membres add column if not exists biographie text;
