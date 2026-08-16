-- TEMPORAIRE — fenetre de test elargie pour les vues collectives du
-- Diagnostic Smart Port (phase 2 "live" par organisation + phase 4
-- "projection" globale). Les deux RPC ne comptaient que les diagnostics
-- soumis pendant la conference (15-18 sept 2026), ce qui empechait de
-- verifier l'affichage avec des donnees de test avant l'evenement.
--
-- Fenetre elargie ICI : 16-17 aout 2026 uniquement (aujourd'hui + demain).
--
-- A RETIRER avant la conference : une migration ulterieure doit restaurer
-- la fenetre '2026-09-15' -> '2026-09-18' dans les deux fonctions
-- ci-dessous avant le 15 septembre 2026, sans quoi les vues resteraient
-- ouvertes sur une mauvaise periode pendant l'evenement.

create or replace function public.get_diagnostic_live_aggregate(
  p_organisation_id text,
  p_site_id text default null
) returns table(axis_id text, moyenne numeric, nb_reponses bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    kv.key as axis_id,
    avg((kv.value)::numeric) as moyenne,
    count(*) as nb_reponses
  from public.diagnostics d,
       jsonb_each_text(d.scores) as kv
  where d.organisation_id = p_organisation_id
    and (
      (p_site_id is null and d.site_id is null)
      or d.site_id = p_site_id
    )
    and d.created_at >= '2026-08-16 00:00:00+00'
    and d.created_at <  '2026-08-18 00:00:00+00'
  group by kv.key;
$$;

create or replace function public.get_diagnostic_global_aggregate(
  p_reseau text default null
) returns table(axis_id text, moyenne numeric, nb_reponses bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    kv.key as axis_id,
    avg((kv.value)::numeric) as moyenne,
    count(*) as nb_reponses
  from public.diagnostics d,
       jsonb_each_text(d.scores) as kv
  where (p_reseau is null or d.reseau = p_reseau)
    and d.created_at >= '2026-08-16 00:00:00+00'
    and d.created_at <  '2026-08-18 00:00:00+00'
  group by kv.key;
$$;
