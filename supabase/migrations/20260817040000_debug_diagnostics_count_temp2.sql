-- TEMPORAIRE — verification d'urgence : un diagnostic reel a disparu.
-- A supprimer une fois l'investigation terminee.
create or replace function public.debug_diagnostics_list()
returns table(id uuid, organisation text, created_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select id, organisation, created_at from public.diagnostics order by created_at desc;
$$;
grant execute on function public.debug_diagnostics_list() to anon, authenticated;
