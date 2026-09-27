-- Lettre de mission : document officiel signe du DG, pour l'equipe
-- d'organisation, les intervenants et le comite d'organisation. Les champs
-- personnels (nom, fonction, organisation, pays, passeport) sont deja en
-- base (table intervenants) ; cette table ne stocke que ce qui est propre
-- a la mission elle-meme (qualite retenue, role, dates, frais pris en
-- charge), saisi par l'admin, un enregistrement par dossier.
create table public.lettres_mission (
  dossier text primary key,
  qualite text not null default 'intervenant' check (qualite in ('comite', 'equipe', 'intervenant', 'autre')),
  qualite_autre text,
  role_attributions text,
  date_debut date,
  date_fin date,
  itineraire text,
  frais_transport boolean not null default false,
  frais_hebergement boolean not null default false,
  frais_restauration boolean not null default false,
  frais_transferts boolean not null default false,
  reference text,
  lieu_signature text not null default 'Casablanca',
  statut text not null default 'aucun' check (statut in ('aucun', 'prete', 'envoyee')),
  genere_le timestamptz,
  envoyee_le timestamptz,
  updated_at timestamptz not null default now(),
  updated_par text
);

alter table public.lettres_mission enable row level security;

create policy "admin_all_lettres_mission" on public.lettres_mission
  for all to authenticated using (is_admin('all')) with check (is_admin('all'));

-- Lecture publique (par la personne elle-meme depuis son espace intervenant),
-- uniquement une fois la lettre marquee prete/envoyee par l'admin, et
-- uniquement les champs necessaires a la generation du PDF cote client
-- (jamais un acces direct a la table).
create or replace function public.lettre_mission_public(p_dossier text)
returns table(
  dossier text, qualite text, qualite_autre text, role_attributions text,
  date_debut date, date_fin date, itineraire text,
  frais_transport boolean, frais_hebergement boolean, frais_restauration boolean, frais_transferts boolean,
  reference text, lieu_signature text,
  nom text, prenom text, fonction text, organisation text, pays text, numero_passeport text
)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  return query
    select lm.dossier, lm.qualite, lm.qualite_autre, lm.role_attributions,
           lm.date_debut, lm.date_fin, lm.itineraire,
           lm.frais_transport, lm.frais_hebergement, lm.frais_restauration, lm.frais_transferts,
           lm.reference, lm.lieu_signature,
           iv.nom, iv.prenom, iv.fonction, iv.organisation, iv.pays, iv.numero_passeport
    from public.lettres_mission lm
    join public.intervenants iv on lower(iv.dossier) = lower(lm.dossier)
    where lower(lm.dossier) = lower(p_dossier) and lm.statut in ('prete', 'envoyee');
end;
$$;

grant execute on function public.lettre_mission_public(text) to anon, authenticated;
