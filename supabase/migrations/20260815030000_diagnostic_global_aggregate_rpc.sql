-- Diagnostic Smart Port — mode projection (phase 4) : moyenne collective en
-- direct toutes organisations confondues (ou filtree par reseau regional),
-- pour affichage plein ecran en salle de conference. Meme principe de
-- confidentialite que get_diagnostic_live_aggregate (phase 2) : SECURITY
-- DEFINER, ne renvoie jamais de donnee nominative ni de reponse
-- individuelle, uniquement des moyennes agregees par axe.

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
    and d.created_at >= '2026-09-15 00:00:00+00'
    and d.created_at <  '2026-09-18 00:00:00+00'
  group by kv.key;
$$;

grant execute on function public.get_diagnostic_global_aggregate(text) to anon, authenticated;
