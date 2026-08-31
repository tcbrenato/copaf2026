-- Jeton a usage unique, genere cote client a l'inscription, jamais affiche
-- nulle part (ni sur le dossier, ni sur /verifier, ni dans les PDF). Sert
-- uniquement a autoriser l'appel a l'Edge Function generate-espace-link
-- juste apres la soumission du formulaire, pour inserer un lien magique
-- deja pret dans l'email de confirmation.
alter table public.inscriptions
  add column if not exists espace_link_token uuid,
  add column if not exists espace_link_used boolean not null default false;
