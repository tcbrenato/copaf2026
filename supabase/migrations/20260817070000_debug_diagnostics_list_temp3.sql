-- TEMPORAIRE — verification que la reparation du diagnostic Nouakchott a
-- bien pris effet. A supprimer juste apres verification.
create or replace function public.debug_diagnostics_list()
returns table(id uuid, organisation text, has_v2 boolean, reco_preview text)
language sql
security definer
set search_path = public
stable
as $$
  select id, organisation, (recommandations_v2 is not null) as has_v2, left(recommandations, 40) as reco_preview
  from public.diagnostics order by created_at desc;
$$;
grant execute on function public.debug_diagnostics_list() to anon, authenticated;
