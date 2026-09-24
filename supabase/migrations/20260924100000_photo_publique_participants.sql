-- La photo de profil devient publique sur la destination du QR code des participants et delegues,
-- au meme titre que pour les intervenants (nom/prenom/fonction/organisation deja publics ; email,
-- telephone, pays et presence restent reserves au staff). Sert aussi a afficher un avatar dans
-- l'espace intervenant (intervenant_login n'exposait pas encore photo_url).
create or replace function public.badge_lookup(p_token uuid)
returns table(dossier text, nom text, prenom text, poste text, organisation text, categorie text, photo_url text, email text, telephone text, pays text, arrived boolean, arrived_at timestamptz, is_staff boolean, langue text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_staff boolean := coalesce(public.is_admin('checkin'), false);
begin
  return query
  select
    i.dossier, c.nom, c.prenom, c.poste, c.organisation, i.badge_categorie,
    i.photo_url,
    case when v_staff then c.email end,
    case when v_staff then c.telephone end,
    case when v_staff then c.pays end,
    case when v_staff then i.arrived end,
    case when v_staff then i.arrived_at end,
    v_staff,
    coalesce(i.langue, 'fr')
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token
  union all
  select
    ip.dossier, ip.nom, ip.prenom, ip.poste, c.organisation, ip.badge_categorie,
    ip.photo_url,
    case when v_staff then ip.email end,
    case when v_staff then ip.telephone end,
    case when v_staff then c.pays end,
    case when v_staff then ip.arrived end,
    case when v_staff then ip.arrived_at end,
    v_staff,
    coalesce(ip.langue, 'fr')
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.badge_token = p_token
  union all
  select
    iv.dossier, iv.nom, iv.prenom, iv.fonction, iv.organisation, 'Intervenant',
    iv.photo_url,
    iv.email,
    iv.telephone,
    iv.pays,
    case when v_staff then iv.arrived end,
    case when v_staff then iv.arrived_at end,
    v_staff,
    'fr'
  from public.intervenants iv
  where iv.badge_token = p_token
  limit 1;
end;
$function$;

create or replace function public.intervenant_login(p_nom text, p_code text, p_email text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_needle text;
  v_row public.intervenants;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text;
begin
  if p_code is null or btrim(p_code) = '' then
    return null;
  end if;

  v_needle := lower(unaccent(coalesce(btrim(p_nom), '')));
  if v_needle = '' then
    return null;
  end if;

  v_cle := 'iv:' || left(v_needle, 60);
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'iv:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select i.* into v_row
  from public.intervenants i
  where (lower(unaccent(i.prenom || ' ' || i.nom)) like '%' || v_needle || '%'
      or lower(unaccent(i.nom || ' ' || i.prenom)) like '%' || v_needle || '%')
    and lower(btrim(i.code_acces)) = lower(btrim(p_code))
    and (
      i.email is null
      or lower(btrim(i.email)) = lower(btrim(coalesce(p_email, '')))
    )
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_row.id is not null);

  if v_row.id is null then
    return null;
  end if;

  perform public.log_connexion(v_row.dossier, 'intervenant');

  return jsonb_build_object(
    'dossier', v_row.dossier, 'nom', v_row.nom, 'prenom', v_row.prenom,
    'organisation', v_row.organisation, 'fonction', v_row.fonction,
    'interventions', v_row.interventions, 'badge_token', v_row.badge_token,
    'equipe', v_row.equipe, 'photo_url', v_row.photo_url
  );
end;
$function$;
