-- Masquage en bloc par categorie (participants, intervenants) pour l'equipe
-- terrain (comptes dossier+PIN) : une seule ligne masque toute la categorie,
-- y compris les futures inscriptions. L'admin voit toujours tout le monde.
create table if not exists public.terrain_masques_categories (
  categorie text primary key check (categorie in ('participant', 'intervenant')),
  masque_le timestamptz not null default now(),
  masque_par text
);

alter table public.terrain_masques_categories enable row level security;

drop policy if exists admin_all_terrain_masques_categories on public.terrain_masques_categories;
create policy admin_all_terrain_masques_categories on public.terrain_masques_categories
  for all to authenticated
  using (is_admin('all'))
  with check (is_admin('all'));

-- terrain_liste : meme signature que 20261001120000, exclut en plus les
-- categories masquees en bloc quand le niveau est 'limite'.
create or replace function public.terrain_liste(p_jour date default null::date, p_dossier text default null::text, p_pin text default null::text)
returns table(personne_type text, personne_id text, dossier text, prenom text, nom text, photo_url text, organisation text, fonction text, delegation text, categorie text, pays text, statut_dossier text, vol_arrivee text, heure_arrivee text, vol_depart text, heure_depart text, hotel text, badge_token uuid, etapes jsonb, incidents_ouverts integer, date_arrivee date, date_depart date, masque_terrain boolean)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_jour date := coalesce(p_jour, (now() at time zone 'Africa/Casablanca')::date);
  v_niveau text := public._terrain_niveau(p_dossier, p_pin);
begin
  return query
  with personnes as (
    select 'inscription'::text as personne_type, i.dossier as personne_id, i.dossier,
           c.prenom, c.nom, i.photo_url, c.organisation, c.poste, i.delegation_nom as delegation,
           'participant'::text as categorie, c.pays,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end) as statut_dossier,
           i.badge_token
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')

    union all

    select 'participant_groupe'::text, ip.dossier, ip.dossier,
           ip.prenom, ip.nom, ip.photo_url, c.organisation, ip.poste, i.delegation_nom,
           'participant'::text, c.pays,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end),
           ip.badge_token
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')

    union all

    select (case when iv.equipe then 'equipe' else 'intervenant' end)::text, iv.dossier, iv.dossier,
           iv.prenom, iv.nom, iv.photo_url, iv.organisation, iv.fonction, null::text,
           (case when iv.equipe then 'organisation' else 'intervenant' end)::text, iv.pays,
           null::text, iv.badge_token
    from public.intervenants iv
  ),
  vols as (
    select v.dossier, v.vol_aller ->> 'numero' as vol_arrivee, v.vol_aller ->> 'heure' as heure_arrivee,
           v.vol_retour ->> 'numero' as vol_depart, v.vol_retour ->> 'heure' as heure_depart, v.hotel,
           (v.vol_aller ->> 'date')::date as date_arrivee, (v.vol_retour ->> 'date')::date as date_depart
    from public.voyages v
  ),
  etapes_agg as (
    select st.personne_type, st.personne_id,
           jsonb_object_agg(st.etape, jsonb_build_object('id', st.id, 'fait_le', st.fait_le, 'fait_par', st.fait_par, 'valeur', st.valeur, 'mode', st.mode)) as etapes
    from public.suivi_terrain st
    where st.annule_le is null and (st.etape <> 'present' or st.jour = v_jour)
    group by st.personne_type, st.personne_id
  ),
  incidents_agg as (
    select si.personne_type, si.personne_id, count(*) as n
    from public.suivi_incidents si
    where si.resolu_le is null
    group by si.personne_type, si.personne_id
  )
  select p.personne_type, p.personne_id, p.dossier, p.prenom, p.nom, p.photo_url,
         p.organisation, p.poste, p.delegation, p.categorie, p.pays, p.statut_dossier,
         vo.vol_arrivee, vo.heure_arrivee, vo.vol_depart, vo.heure_depart, vo.hotel,
         p.badge_token, coalesce(ea.etapes, '{}'::jsonb), coalesce(ia.n, 0)::int,
         vo.date_arrivee, vo.date_depart, (tm.personne_id is not null) as masque_terrain
  from personnes p
  left join vols vo on vo.dossier = p.dossier
  left join etapes_agg ea on ea.personne_type = p.personne_type and ea.personne_id = p.personne_id
  left join incidents_agg ia on ia.personne_type = p.personne_type and ia.personne_id = p.personne_id
  left join public.terrain_masques tm on tm.personne_type = p.personne_type and tm.personne_id = p.personne_id
  where v_niveau is not null
    and (v_niveau = 'admin'
         or (tm.personne_id is null
             and not exists (select 1 from public.terrain_masques_categories mc where mc.categorie = p.categorie)))
  order by p.nom, p.prenom;
end;
$function$;
