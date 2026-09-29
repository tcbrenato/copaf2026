-- Le personnel dossier+PIN (Yvette, Eliram, equipe Maroc) aide aussi a
-- l'accueil aeroport/hotel/conference/depart : badge_checkin et
-- staff_search acceptent desormais le meme niveau d'acces que /terrain
-- (_terrain_niveau), mais sans la restriction "categorie organisation" du
-- tableau de bord - le scan/la recherche doivent trouver n'importe qui
-- (participant, intervenant, equipe) puisque c'est leur role a l'accueil.

drop function if exists public.badge_checkin(uuid, text);

create function public.badge_checkin(p_token uuid, p_fait_par text default null, p_dossier text default null, p_pin text default null)
returns table(dossier text, nom text, prenom text, organisation text, photo_url text, arrived boolean, arrived_at timestamptz, deja_arrive boolean)
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
  v_photo text;
  v_arrived boolean;
  v_arrived_at timestamptz;
  v_pt text;
  v_deja boolean;
  v_jour date := (now() at time zone 'Africa/Casablanca')::date;
  v_compte text;
  v_niveau text := public._terrain_niveau(p_dossier, p_pin); -- leve une exception si non autorise
  v_auteur text;
begin
  select email into v_compte from public.admins where user_id = auth.uid();
  v_auteur := case when v_niveau = 'limite'
    then (select iv2.prenom from public.intervenants iv2 where lower(iv2.dossier) = lower(p_dossier))
    else coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu')
  end;

  select i.id, i.dossier, c.nom, c.prenom, c.organisation, i.photo_url, i.arrived, i.arrived_at
  into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token;

  if found then
    v_pt := 'inscription';
  else
    select ip.id, ip.dossier, ip.nom, ip.prenom, c.organisation, ip.photo_url, ip.arrived, ip.arrived_at
    into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where ip.badge_token = p_token;

    if found then
      v_pt := 'participant_groupe';
    else
      select iv.id, iv.dossier, iv.nom, iv.prenom, iv.organisation, iv.photo_url, iv.arrived, iv.arrived_at
      into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
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

  -- Journal terrain : une ligne 'present' du jour, jamais de doublon (index unique).
  insert into public.suivi_terrain (personne_type, personne_id, etape, jour, mode, fait_par, compte)
  values (v_pt, v_dossier, 'present', v_jour, 'scan', v_auteur, coalesce(v_compte, p_dossier))
  on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null do nothing;

  return query select v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at, v_deja;
end;
$$;
revoke execute on function public.badge_checkin(uuid, text, text, text) from public;
grant execute on function public.badge_checkin(uuid, text, text, text) to anon, authenticated;

drop function if exists public.staff_search(text);

create function public.staff_search(p_query text, p_dossier text default null, p_pin text default null)
returns table(dossier text, badge_token uuid, nom text, prenom text, organisation text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform public._terrain_niveau(p_dossier, p_pin); -- leve une exception si non autorise

  return query
  select i.dossier, i.badge_token, c.nom, c.prenom, c.organisation
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.dossier ilike '%' || p_query || '%' or c.nom ilike '%' || p_query || '%' or c.prenom ilike '%' || p_query || '%'
  union all
  select ip.dossier, ip.badge_token, ip.nom, ip.prenom, c.organisation
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.dossier ilike '%' || p_query || '%' or ip.nom ilike '%' || p_query || '%' or ip.prenom ilike '%' || p_query || '%'
  union all
  select iv.dossier, iv.badge_token, iv.nom, iv.prenom, iv.organisation
  from public.intervenants iv
  where iv.dossier ilike '%' || p_query || '%' or iv.nom ilike '%' || p_query || '%' or iv.prenom ilike '%' || p_query || '%'
  limit 15;
end;
$$;
revoke execute on function public.staff_search(text, text, text) from public;
grant execute on function public.staff_search(text, text, text) to anon, authenticated;
