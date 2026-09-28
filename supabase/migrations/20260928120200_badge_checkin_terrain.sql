-- badge_checkin (StaffScan) alimente desormais aussi suivi_terrain : un scan
-- reussi cree une ligne etape='present' du jour (Africa/Casablanca), mode='scan'.
-- Comportement existant inchangé (arrived/arrived_at/checked_in_by, message
-- "deja arrivé" via deja_arrive) : p_fait_par est optionnel pour ne rien
-- casser chez les appelants actuels (BadgeToken.jsx n'en passe pas).
-- L'index unique de suivi_terrain empeche un doublon si la meme personne est
-- deja marquee presente ce jour-la (ex. re-scan involontaire) ; un scan un
-- autre jour cree bien une seconde ligne distincte.

drop function if exists public.badge_checkin(uuid);

create function public.badge_checkin(p_token uuid, p_fait_par text default null)
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
begin
  if not coalesce(public.is_admin('checkin'), false) then
    raise exception 'Acces reserve au personnel accueil';
  end if;

  select email into v_compte from public.admins where user_id = auth.uid();

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
  values (v_pt, v_dossier, 'present', v_jour, 'scan', coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu'), v_compte)
  on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null do nothing;

  return query select v_dossier, v_nom, v_prenom, v_org, v_photo, v_arrived, v_arrived_at, v_deja;
end;
$$;
revoke execute on function public.badge_checkin(uuid, text) from public, anon;
grant execute on function public.badge_checkin(uuid, text) to authenticated;
