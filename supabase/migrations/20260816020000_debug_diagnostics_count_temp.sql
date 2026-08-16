-- TEMPORAIRE — fonction de debug pour verifier combien de diagnostics
-- existent et sur quelle periode, sans exposer de donnee individuelle.
-- A SUPPRIMER une fois le diagnostic termine.

create or replace function public.debug_diagnostics_stats()
returns table(total bigint, min_created timestamptz, max_created timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select count(*), min(created_at), max(created_at) from public.diagnostics;
$$;

grant execute on function public.debug_diagnostics_stats() to anon, authenticated;
