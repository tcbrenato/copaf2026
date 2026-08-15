-- Diagnostic Smart Port collaboratif (phase 2) : moyenne collective en
-- direct par site, sans jamais exposer de donnee nominative ni de reponse
-- individuelle. La table public.diagnostics reste verrouillee en lecture
-- aux admins (RLS, cf. 20260815000000). Cette RPC SECURITY DEFINER est le
-- seul point d'acces public en lecture, et ne renvoie que des moyennes
-- agregees par axe, limitees aux diagnostics soumis pendant la conference.

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
    and d.created_at >= '2026-09-15 00:00:00+00'
    and d.created_at <  '2026-09-18 00:00:00+00'
  group by kv.key;
$$;

grant execute on function public.get_diagnostic_live_aggregate(text, text) to anon, authenticated;
