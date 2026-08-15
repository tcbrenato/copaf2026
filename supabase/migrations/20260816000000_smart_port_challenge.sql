-- COPAF Smart Port Challenge (demo tablette, ecran "/demo").
-- Le score est calcule et insere uniquement par la Edge Function
-- smart-port-challenge-score (cle service_role, bypasse RLS) — jamais par
-- le client. La table reste donc verrouillee, sans aucune policy anon :
-- ni insert, ni select direct. Le classement live (ecran de projection)
-- passe par la RPC ci-dessous, qui ne renvoie jamais l'email (donnee
-- personnelle) et deduplique par participant (on garde son meilleur score,
-- pour qu'un rejoueur ne monopolise pas le top 10).

create table if not exists public.copaf_demo_scores (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  nom        text not null,
  port       text,
  score      int not null,
  temps      numeric not null,
  cout       int not null,
  created_at timestamptz not null default now()
);

alter table public.copaf_demo_scores enable row level security;
-- Aucune policy anon/authenticated : lecture et ecriture uniquement via
-- service_role (Edge Function) et la RPC SECURITY DEFINER ci-dessous.

create or replace function public.get_smart_port_challenge_top10()
returns table(nom text, port text, score int)
language sql
security definer
set search_path = public
stable
as $$
  select nom, port, score
  from (
    select distinct on (email) email, nom, port, score
    from public.copaf_demo_scores
    order by email, score desc
  ) meilleurs_scores
  order by score desc
  limit 10;
$$;

grant execute on function public.get_smart_port_challenge_top10() to anon, authenticated;
