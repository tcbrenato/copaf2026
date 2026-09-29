-- Ajoute la fonction/poste (jamais l'email/telephone/passeport, deja
-- absents) au scan et au tableau terrain : demande explicite pour que
-- l'accueil sache qui accueillir sans voir de coordonnees.

drop function if exists public.badge_checkin(uuid, text, text, text);

create function public.badge_checkin(p_token uuid, p_fait_par text default null, p_dossier text default null, p_pin text default null)
returns table(dossier text, nom text, prenom text, organisation text, poste text, photo_url text, arrived boolean, arrived_at timestamptz, deja_arrive boolean)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_dossier text;
  v_nom text;
  v_prenom text;
  v_org text;
  v_poste text;
  v_photo text;
  v_arrived boolean;
  v_arrived_at timestamptz;
  v_pt text;
  v_deja boolean;
  v_jour date := (now() at time zone 'Africa/Casablanca')::date;
  v_compte text;
  v_niveau text := public._terrain_niveau(p_dossier, p_pin);
  v_auteur text;
begin
  select email into v_compte from public.admins where user_id = auth.uid();
  v_auteur := case when v_niveau = 'limite'
    then (select iv2.prenom from public.intervenants iv2 where lower(iv2.dossier) = lower(p_dossier))
    else coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu')
  end;

  select i.id, i.dossier, c.nom, c.prenom, c.organisation, c.poste, i.photo_url, i.arrived, i.arrived_at
  into v_id, v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo, v_arrived, v_arrived_at
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token;

  if found then
    v_pt := 'inscription';
  else
    select ip.id, ip.dossier, ip.nom, ip.prenom, c.organisation, ip.poste, ip.photo_url, ip.arrived, ip.arrived_at
    into v_id, v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo, v_arrived, v_arrived_at
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where ip.badge_token = p_token;

    if found then
      v_pt := 'participant_groupe';
    else
      select iv.id, iv.dossier, iv.nom, iv.prenom, iv.organisation, iv.fonction, iv.photo_url, iv.arrived, iv.arrived_at
      into v_id, v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo, v_arrived, v_arrived_at
      from public.intervenants iv
      where iv.badge_token = p_token;

      if found then
        v_pt := case when (select equipe from public.intervenants where id = v_id) then 'equipe' else 'intervenant' end;
      else
        raise exception 'Badge introuvable';
      end if;
    end if;
  end if;

  v_deja := v_arrived;

  if not v_arrived then
    if v_pt = 'inscription' then
      update public.inscriptions set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    elsif v_pt = 'participant_groupe' then
      update public.inscription_participants set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    else
      update public.intervenants set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    end if;
    v_arrived := true;
    v_arrived_at := now();
  end if;

  insert into public.suivi_terrain (personne_type, personne_id, etape, jour, mode, fait_par, compte)
  values (v_pt, v_dossier, 'present', v_jour, 'scan', v_auteur, coalesce(v_compte, p_dossier))
  on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null do nothing;

  return query select v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo, v_arrived, v_arrived_at, v_deja;
end;
$$;
revoke execute on function public.badge_checkin(uuid, text, text, text) from public;
grant execute on function public.badge_checkin(uuid, text, text, text) to anon, authenticated;

drop function if exists public.terrain_liste(date, text, text);

create function public.terrain_liste(p_jour date default null, p_dossier text default null, p_pin text default null)
returns table(
  personne_type text, personne_id text, dossier text, prenom text, nom text,
  photo_url text, organisation text, fonction text, delegation text, categorie text, pays text,
  statut_dossier text, vol_arrivee text, heure_arrivee text, vol_depart text, heure_depart text,
  hotel text, badge_token uuid, etapes jsonb, incidents_ouverts int
)
language plpgsql
security definer
set search_path to 'public'
as $$
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
         p.organisation, p.poste, p.delegation, p.categorie, p.pays, p.statut_dossier,
         vo.vol_arrivee, vo.heure_arrivee, vo.vol_depart, vo.heure_depart, vo.hotel,
         p.badge_token, coalesce(ea.etapes, '{}'::jsonb), coalesce(ia.n, 0)::int
  from personnes p
  left join vols vo on vo.dossier = p.dossier
  left join etapes_agg ea on ea.personne_type = p.personne_type and ea.personne_id = p.personne_id
  left join incidents_agg ia on ia.personne_type = p.personne_type and ia.personne_id = p.personne_id
  where v_niveau = 'admin' or p.categorie = 'organisation'
  order by p.nom, p.prenom;
end;
$$;
revoke execute on function public.terrain_liste(date, text, text) from public;
grant execute on function public.terrain_liste(date, text, text) to anon, authenticated;

drop function if exists public.staff_search(text, text, text);

create function public.staff_search(p_query text, p_dossier text default null, p_pin text default null)
returns table(dossier text, badge_token uuid, nom text, prenom text, organisation text, poste text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public._terrain_niveau(p_dossier, p_pin);

  return query
  select i.dossier, i.badge_token, c.nom, c.prenom, c.organisation, c.poste
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.dossier ilike '%' || p_query || '%' or c.nom ilike '%' || p_query || '%' or c.prenom ilike '%' || p_query || '%'
  union all
  select ip.dossier, ip.badge_token, ip.nom, ip.prenom, c.organisation, ip.poste
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.dossier ilike '%' || p_query || '%' or ip.nom ilike '%' || p_query || '%' or ip.prenom ilike '%' || p_query || '%'
  union all
  select iv.dossier, iv.badge_token, iv.nom, iv.prenom, iv.organisation, iv.fonction
  from public.intervenants iv
  where iv.dossier ilike '%' || p_query || '%' or iv.nom ilike '%' || p_query || '%' or iv.prenom ilike '%' || p_query || '%'
  limit 15;
end;
$$;
revoke execute on function public.staff_search(text, text, text) from public;
grant execute on function public.staff_search(text, text, text) to anon, authenticated;
