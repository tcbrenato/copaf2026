-- 1) Membres de delegation sans email enregistre (ex. delegation NPA) : leur email est leur
--    mot de passe. A la premiere connexion (dossier + email), l'email saisi est enregistre
--    sur leur fiche ; ensuite, dossier + ce meme email. Le code d'acces reste possible en
--    secours. Verrouillage apres essais rates inchange.
create or replace function public._badge_authentifier(p_dossier text, p_secret text)
returns table(cible text, cible_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_secret text := btrim(coalesce(p_secret, ''));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_id uuid;
  v_cible text;
begin
  if v_dossier = '' or v_secret = '' then return; end if;

  if (select count(*) from public.badge_login_attempts where cle = v_dossier and not success and created_at > now() - interval '15 minutes') >= 5
     or (select count(*) from public.badge_login_attempts where ip = v_ip and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard / Too many attempts, try again later';
  end if;

  -- Contact principal d'une inscription : secret = son email
  select i.id into v_id
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where lower(i.dossier) = v_dossier and c.email is not null and lower(c.email) = lower(v_secret)
  limit 1;
  if v_id is not null then v_cible := 'inscriptions'; end if;

  -- Membre de delegation : secret = email (ou code d'acces en secours)
  if v_id is null then
    select ip.id into v_id
    from public.inscription_participants ip
    where lower(ip.dossier) = v_dossier
      and ((ip.code_acces is not null and upper(ip.code_acces) = upper(v_secret))
           or (ip.email is not null and lower(ip.email) = lower(v_secret)))
    limit 1;
    if v_id is not null then v_cible := 'inscription_participants'; end if;
  end if;

  -- Premiere connexion d'un membre sans email : l'email saisi devient son mot de passe
  if v_id is null and v_secret ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    select ip.id into v_id
    from public.inscription_participants ip
    where lower(ip.dossier) = v_dossier and coalesce(btrim(ip.email), '') = ''
    limit 1;
    if v_id is not null then
      update public.inscription_participants set email = lower(v_secret) where id = v_id;
      v_cible := 'inscription_participants';
    end if;
  end if;

  -- Intervenant : secret = son email
  if v_id is null then
    select iv.id into v_id
    from public.intervenants iv
    where lower(iv.dossier) = v_dossier and iv.email is not null and lower(iv.email) = lower(v_secret)
    limit 1;
    if v_id is not null then v_cible := 'intervenants'; end if;
  end if;

  insert into public.badge_login_attempts (cle, ip, success) values (v_dossier, v_ip, v_id is not null);

  if v_id is null then return; end if;
  cible := v_cible;
  cible_id := v_id;
  return next;
end;
$function$;
revoke execute on function public._badge_authentifier(text, text) from public, anon, authenticated;

-- 2) badge_lookup : retour a la forme d'origine (le public ne voit que l'essentiel,
--    plus d'indicateur "incomplet").
drop function if exists public.badge_lookup(uuid);
create function public.badge_lookup(p_token uuid)
returns table(dossier text, nom text, prenom text, poste text, organisation text, categorie text,
  photo_url text, email text, telephone text, pays text, arrived boolean, arrived_at timestamptz,
  is_staff boolean, langue text)
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
    case when v_staff then i.photo_url end,
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
    case when v_staff then ip.photo_url end,
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
grant execute on function public.badge_lookup(uuid) to anon, authenticated;
