-- RPC du tableau de bord terrain (/terrain). Toutes SECURITY DEFINER,
-- search_path fixe, controle is_admin('checkin') en premiere ligne (comme
-- staff_search/badge_checkin), executees uniquement par authenticated.
--
-- personne_type/personne_id : la cle naturelle est le "dossier" existant
-- (COPAF2026-xxxxx pour inscription/participant_groupe, INT2026-xxx pour
-- intervenant/equipe) - pas de nouvelle table de personnes, on reutilise
-- inscriptions/inscription_participants/intervenants tels quels.
-- intervenants.equipe distingue 'intervenant' de 'equipe' (categorie
-- 'organisation') : pas de table equipe separee dans ce schema.

create or replace function public.terrain_liste(p_jour date default null)
returns table(
  personne_type text, personne_id text, dossier text, prenom text, nom text,
  photo_url text, organisation text, delegation text, categorie text, pays text,
  statut_dossier text, vol_arrivee text, heure_arrivee text, vol_depart text, heure_depart text,
  hotel text, badge_token uuid, etapes jsonb, incidents_ouverts int
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_jour date := coalesce(p_jour, (now() at time zone 'Africa/Casablanca')::date);
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  return query
  with personnes as (
    select 'inscription'::text as personne_type, i.dossier as personne_id, i.dossier,
           c.prenom, c.nom, i.photo_url, c.organisation, i.delegation_nom as delegation,
           'participant'::text as categorie, c.pays,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end) as statut_dossier,
           i.badge_token
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')

    union all

    select 'participant_groupe'::text, ip.dossier, ip.dossier,
           ip.prenom, ip.nom, ip.photo_url, c.organisation, i.delegation_nom,
           'participant'::text, c.pays,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end),
           ip.badge_token
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')

    union all

    select (case when iv.equipe then 'equipe' else 'intervenant' end)::text, iv.dossier, iv.dossier,
           iv.prenom, iv.nom, iv.photo_url, iv.organisation, null::text,
           (case when iv.equipe then 'organisation' else 'intervenant' end)::text, iv.pays,
           null::text, iv.badge_token
    from public.intervenants iv
  ),
  vols as (
    select v.dossier, v.vol_aller ->> 'numero' as vol_arrivee, v.vol_aller ->> 'heure' as heure_arrivee,
           v.vol_retour ->> 'numero' as vol_depart, v.vol_retour ->> 'heure' as heure_depart, v.hotel
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
         p.organisation, p.delegation, p.categorie, p.pays, p.statut_dossier,
         vo.vol_arrivee, vo.heure_arrivee, vo.vol_depart, vo.heure_depart, vo.hotel,
         p.badge_token, coalesce(ea.etapes, '{}'::jsonb), coalesce(ia.n, 0)::int
  from personnes p
  left join vols vo on vo.dossier = p.dossier
  left join etapes_agg ea on ea.personne_type = p.personne_type and ea.personne_id = p.personne_id
  left join incidents_agg ia on ia.personne_type = p.personne_type and ia.personne_id = p.personne_id
  order by p.nom, p.prenom;
end;
$$;
revoke execute on function public.terrain_liste(date) from public, anon;

create or replace function public.terrain_marquer(
  p_personne_type text, p_personne_id text, p_etape text, p_jour date,
  p_valeur text, p_mode text, p_fait_par text
)
returns table(id uuid, deja_fait boolean)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_compte text;
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;
  if p_etape = 'tablette' and coalesce(btrim(p_valeur), '') = '' then
    raise exception 'Numero de tablette requis';
  end if;

  select email into v_compte from public.admins where user_id = auth.uid();

  -- ON CONFLICT DO NOTHING (plutot qu'un SELECT puis INSERT separes) : evite
  -- la fenetre de course d'un double-appui simultane, qui créerait sinon deux
  -- lignes actives pour la meme etape.
  insert into public.suivi_terrain (personne_type, personne_id, etape, jour, valeur, mode, fait_par, compte)
  values (
    p_personne_type, p_personne_id, p_etape, p_jour, nullif(btrim(p_valeur), ''),
    coalesce(nullif(p_mode, ''), 'manuel'), coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu'), v_compte
  )
  on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null
  do nothing
  returning suivi_terrain.id into v_id;

  if v_id is not null then
    return query select v_id, false;
    return;
  end if;

  select st.id into v_id from public.suivi_terrain st
  where st.personne_type = p_personne_type and st.personne_id = p_personne_id
    and st.etape = p_etape and coalesce(st.jour, '1970-01-01'::date) = coalesce(p_jour, '1970-01-01'::date)
    and st.annule_le is null;

  return query select v_id, true;
end;
$$;
revoke execute on function public.terrain_marquer(text, text, text, date, text, text, text) from public, anon;

create or replace function public.terrain_marquer_groupe(p_delegation text, p_etape text, p_jour date, p_fait_par text)
returns table(marques int)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_compte text;
  v_n int := 0;
  r record;
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;
  if p_etape = 'tablette' then
    raise exception 'Le numero de tablette doit etre saisi individuellement';
  end if;

  select email into v_compte from public.admins where user_id = auth.uid();

  for r in
    select 'inscription'::text as pt, i.dossier as pid from public.inscriptions i
    where i.delegation_nom = p_delegation and i.paiement_status not in ('annule', 'prospect')
    union all
    select 'participant_groupe'::text, ip.dossier from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    where i.delegation_nom = p_delegation and i.paiement_status not in ('annule', 'prospect')
  loop
    insert into public.suivi_terrain (personne_type, personne_id, etape, jour, mode, fait_par, compte)
    values (r.pt, r.pid, p_etape, p_jour, 'groupe', coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu'), v_compte)
    on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null
    do nothing;
    if found then
      v_n := v_n + 1;
    end if;
  end loop;

  return query select v_n;
end;
$$;
revoke execute on function public.terrain_marquer_groupe(text, text, date, text) from public, anon;

create or replace function public.terrain_annuler(p_suivi_id uuid, p_motif text, p_par text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;
  if coalesce(btrim(p_motif), '') = '' then
    raise exception 'Motif requis';
  end if;

  update public.suivi_terrain
  set annule_le = now(), annule_par = coalesce(nullif(btrim(p_par), ''), 'Inconnu'), motif_annulation = p_motif
  where id = p_suivi_id and annule_le is null;

  return found;
end;
$$;
revoke execute on function public.terrain_annuler(uuid, text, text) from public, anon;

create or replace function public.terrain_incident_creer(p_personne_type text, p_personne_id text, p_type text, p_note text, p_par text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;
  if coalesce(btrim(p_note), '') = '' then
    raise exception 'Note requise';
  end if;

  insert into public.suivi_incidents (personne_type, personne_id, type, note, cree_par)
  values (p_personne_type, p_personne_id, p_type, btrim(p_note), coalesce(nullif(btrim(p_par), ''), 'Inconnu'))
  returning id into v_id;

  return v_id;
end;
$$;
revoke execute on function public.terrain_incident_creer(text, text, text, text, text) from public, anon;

create or replace function public.terrain_incident_resoudre(p_id uuid, p_par text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  update public.suivi_incidents set resolu_le = now(), resolu_par = coalesce(nullif(btrim(p_par), ''), 'Inconnu')
  where id = p_id and resolu_le is null;

  return found;
end;
$$;
revoke execute on function public.terrain_incident_resoudre(uuid, text) from public, anon;

create or replace function public.terrain_incidents(p_ouverts_seulement boolean default true)
returns setof public.suivi_incidents
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  return query
  select * from public.suivi_incidents
  where (not p_ouverts_seulement or resolu_le is null)
  order by cree_le desc;
end;
$$;
revoke execute on function public.terrain_incidents(boolean) from public, anon;

create or replace function public.terrain_stats(p_jour date default null)
returns table(categorie text, etape text, faits int, attendus int)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_jour date := coalesce(p_jour, (now() at time zone 'Africa/Casablanca')::date);
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  return query
  with base as (
    select 'participant'::text as categorie, i.dossier as pid, 'inscription'::text as pt
    from public.inscriptions i where i.paiement_status not in ('annule', 'prospect')
    union all
    select 'participant', ip.dossier, 'participant_groupe'
    from public.inscription_participants ip join public.inscriptions i on i.id = ip.inscription_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select (case when iv.equipe then 'organisation' else 'intervenant' end), iv.dossier,
           (case when iv.equipe then 'equipe' else 'intervenant' end)
    from public.intervenants iv
  ),
  etapes as (
    select unnest(array['aeroport', 'hotel', 'badge', 'tablette', 'present', 'tablette_rendue', 'depart']) as etape
  ),
  attendus as (
    select b.categorie, count(*) as n from base b group by b.categorie
  ),
  faits as (
    select b.categorie, st.etape, count(distinct (b.pt, b.pid)) as n
    from base b
    join public.suivi_terrain st on st.personne_type = b.pt and st.personne_id = b.pid
    where st.annule_le is null and (st.etape <> 'present' or st.jour = v_jour)
    group by b.categorie, st.etape
  )
  select a.categorie, e.etape, coalesce(f.n, 0)::int, a.n::int
  from attendus a
  cross join etapes e
  left join faits f on f.categorie = a.categorie and f.etape = e.etape
  order by a.categorie, e.etape;
end;
$$;
revoke execute on function public.terrain_stats(date) from public, anon;

create or replace function public.terrain_eligibles_attestation()
returns table(personne_type text, personne_id text, dossier text, prenom text, nom text, organisation text)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  -- Regle par defaut : present les 2 premiers jours de la conference
  -- (19 et 20 oct. 2026). A confirmer avec la direction - modifier ce
  -- tableau suffit, aucun autre changement necessaire.
  v_jours_requis date[] := array['2026-10-19'::date, '2026-10-20'::date];
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  return query
  with base as (
    select 'inscription'::text as pt, i.dossier as pid, c.prenom, c.nom, c.organisation
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select 'participant_groupe', ip.dossier, ip.prenom, ip.nom, c.organisation
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select (case when iv.equipe then 'equipe' else 'intervenant' end), iv.dossier, iv.prenom, iv.nom, iv.organisation
    from public.intervenants iv
  )
  select b.pt, b.pid, b.pid, b.prenom, b.nom, b.organisation
  from base b
  where (
    select count(distinct st.jour) from public.suivi_terrain st
    where st.personne_type = b.pt and st.personne_id = b.pid and st.etape = 'present'
      and st.annule_le is null and st.jour = any(v_jours_requis)
  ) = array_length(v_jours_requis, 1)
  order by b.nom, b.prenom;
end;
$$;
revoke execute on function public.terrain_eligibles_attestation() from public, anon;
