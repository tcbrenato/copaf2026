-- Galerie publique "Edition 2026" : selection de photos de la conference (vignettes + grandes images dans le bucket edition-2026)
insert into storage.buckets (id, name, public, file_size_limit)
values ('edition-2026', 'edition-2026', true, 10485760)
on conflict (id) do nothing;

create table if not exists public.edition_photos (
  id uuid primary key default gen_random_uuid(),
  jour int not null check (jour between 1 and 3),
  ordre int not null,
  thumb_path text not null,
  full_path text not null,
  largeur int,
  hauteur int,
  legende_fr text,
  legende_en text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists edition_photos_jour_ordre on public.edition_photos (jour, ordre);
alter table public.edition_photos enable row level security;
create policy edition_photos_lecture on public.edition_photos for select to anon, authenticated using (visible);
create policy edition_photos_admin on public.edition_photos for all using (public.is_admin()) with check (public.is_admin());
