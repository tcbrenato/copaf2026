-- Tableau de bord terrain (/terrain) : journal des etapes aeroport -> depart
-- pour chaque personne (participant, membre de delegation, intervenant,
-- equipe/comite). Ecriture uniquement via RPC SECURITY DEFINER (voir
-- migration suivante) ; ces tables n'ont pas de policy INSERT/UPDATE/DELETE
-- pour anon/authenticated, seulement une policy SELECT pour le personnel
-- accueil (necessaire pour Realtime, qui respecte la RLS).

create table public.suivi_terrain (
  id                uuid primary key default gen_random_uuid(),
  personne_type     text not null check (personne_type in ('inscription','participant_groupe','intervenant','equipe')),
  personne_id       text not null,
  etape             text not null check (etape in ('aeroport','hotel','badge','tablette','present','tablette_rendue','depart')),
  jour              date,
  valeur            text,
  mode              text not null default 'manuel' check (mode in ('scan','manuel','groupe')),
  fait_le           timestamptz not null default now(),
  fait_par          text not null,
  compte            text,
  annule_le         timestamptz,
  annule_par        text,
  motif_annulation  text
);

-- Une seule etape active par personne / etape / jour (coalesce pour les
-- etapes non journalieres, ou jour est toujours null).
create unique index suivi_terrain_unique_actif
  on public.suivi_terrain (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date))
  where annule_le is null;

create index suivi_terrain_personne on public.suivi_terrain (personne_type, personne_id);

alter table public.suivi_terrain enable row level security;

create policy staff_select_suivi_terrain on public.suivi_terrain for select to authenticated
  using (public.is_admin('checkin'));

create table public.suivi_incidents (
  id            uuid primary key default gen_random_uuid(),
  personne_type text not null,
  personne_id   text not null,
  type          text not null check (type in ('vol_retarde','bagage','sante','hotel','badge','autre')),
  note          text not null,
  cree_le       timestamptz not null default now(),
  cree_par      text not null,
  resolu_le     timestamptz,
  resolu_par    text
);

create index suivi_incidents_personne on public.suivi_incidents (personne_type, personne_id);
create index suivi_incidents_ouverts on public.suivi_incidents (resolu_le) where resolu_le is null;

alter table public.suivi_incidents enable row level security;

create policy staff_select_suivi_incidents on public.suivi_incidents for select to authenticated
  using (public.is_admin('checkin'));

-- Realtime : la publication supabase_realtime ne contient pas toutes les
-- tables par defaut (verifie : seules diagnostic_session, diagnostics,
-- inscriptions, sondages, votes y figurent) - ajout explicite necessaire
-- pour que /terrain recoive les mises a jour en direct entre plusieurs
-- comptes/appareils.
alter publication supabase_realtime add table public.suivi_terrain;
alter publication supabase_realtime add table public.suivi_incidents;
