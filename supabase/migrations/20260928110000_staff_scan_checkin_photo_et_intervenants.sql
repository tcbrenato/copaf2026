-- badge_checkin renvoie desormais organisation + photo pour la banniere
-- de confirmation au comptoir (voir StaffScan.jsx, scan continu).
-- staff_search couvrait inscriptions + inscription_participants mais pas
-- intervenants/equipe : leur recherche manuelle (QR illisible) echouait.

drop function if exists public.badge_checkin(uuid);

create function public.badge_checkin(p_token uuid)
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
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  select i.id, i.dossier, c.nom, c.prenom, c.organisation, i.photo_url, i.arrived, i.arrived_at
  into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token;

  if found then
    if v_arrived then
      return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, v_arrived_at, true;
      return;
    end if;
    update public.inscriptions set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, now(), false;
    return;
  end if;

  select ip.id, ip.dossier, ip.nom, ip.prenom, c.organisation, ip.photo_url, ip.arrived, ip.arrived_at
  into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.badge_token = p_token;

  if found then
    if v_arrived then
      return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, v_arrived_at, true;
      return;
    end if;
    update public.inscription_participants set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, now(), false;
    return;
  end if;

  select iv.id, iv.dossier, iv.nom, iv.prenom, iv.organisation, iv.photo_url, iv.arrived, iv.arrived_at
  into v_id, v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at
  from public.intervenants iv
  where iv.badge_token = p_token;

  if found then
    if v_arrived then
      return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, v_arrived_at, true;
      return;
    end if;
    update public.intervenants set arrived = true, arrived_at = now(), checked_in_by = auth.uid() where id = v_id;
    return query select v_dossier, v_nom, v_prenom, v_org, v_photo, true, now(), false;
    return;
  end if;

  raise exception 'Badge introuvable';
end;
$$;

create or replace function public.staff_search(p_query text)
returns table(dossier text, badge_token uuid, nom text, prenom text, organisation text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

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
