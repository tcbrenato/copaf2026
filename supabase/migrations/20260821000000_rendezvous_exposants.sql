-- Prise de rendez-vous directe depuis une fiche exposant (catalogue
-- "Visiter l'exposition") : un visiteur demande une rencontre individuelle
-- avec un exposant sur son stand pendant la COPAF 2026. La demande est
-- rattachee au contact existant (meme RPC public_upsert_contact que les
-- autres formulaires publics du site) puis journalisee ici pour suivi par
-- l'equipe COPAF.

create table public.rendezvous_exposants (
  id           uuid primary key default gen_random_uuid(),
  contact_id   uuid references public.contacts(id),
  exposant_id  text not null,
  exposant_nom text not null,
  jour_prefere text,
  message      text,
  statut       text not null default 'nouveau',
  created_at   timestamptz not null default now()
);

alter table public.rendezvous_exposants enable row level security;

create policy "public_insert_rendezvous_exposants" on public.rendezvous_exposants
  for insert to anon, authenticated with check (true);
create policy "admin_select_rendezvous_exposants" on public.rendezvous_exposants
  for select to authenticated using (public.is_admin());
create policy "admin_update_rendezvous_exposants" on public.rendezvous_exposants
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_rendezvous_exposants" on public.rendezvous_exposants
  for delete to authenticated using (public.is_admin());
