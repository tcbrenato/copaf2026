-- Statut partage d'un vol (pas d'une personne) : plusieurs personnes
-- partagent souvent le meme vol (ex. une delegation de 12), inutile de
-- repeter la saisie pour chacune. Mis a jour par l'equipe aeroport,
-- visible immediatement dans les vues "Arrivees & departs groupes"
-- (Voyages & Guide + Terrain admin).
create table public.vols_statut (
  numero text not null,
  date date not null,
  statut text not null default 'a_heure' check (statut in ('a_heure', 'retard', 'atterri', 'annule')),
  note text,
  maj_par text,
  updated_at timestamptz not null default now(),
  primary key (numero, date)
);

alter table public.vols_statut enable row level security;

create policy admin_all_vols_statut on public.vols_statut
  for all to authenticated
  using (is_admin('all'))
  with check (is_admin('all'));
