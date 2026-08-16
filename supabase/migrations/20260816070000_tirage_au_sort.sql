-- Outil "tirage au sort" (roue façon Wheel of Names) : tombola clients,
-- animation de formation, etc. Contrairement aux sondages, un seul
-- operateur prepare la liste ET lance la roue depuis le meme ecran (celui
-- branche au projecteur) — pas besoin d'un affichage public separe, donc
-- la table reste entierement reservee aux admins (scope 'all').

create table public.tirage_entrees (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  actif      boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tirage_entrees enable row level security;

create policy "admin_all_tirage_entrees" on public.tirage_entrees
  for all to authenticated
  using (public.is_admin('all'))
  with check (public.is_admin('all'));
