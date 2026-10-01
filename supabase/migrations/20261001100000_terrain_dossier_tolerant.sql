-- Tolere les variantes de saisie du numero de dossier (ex. "INT2026008"
-- sans le tiret, espaces, casse) en comparant les deux cotes sans aucun
-- caractere non alphanumerique, plutot qu'une egalite stricte sur
-- lower(dossier). Memes verrous anti-bruteforce, aucun autre changement.

create or replace function public.terrain_login(p_dossier text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_dossier text := regexp_replace(lower(coalesce(p_dossier, '')), '[^a-z0-9]', '', 'g');
  v_pin text := btrim(coalesce(p_pin, ''));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'tr:' || v_dossier;
  v_row public.intervenants;
begin
  if v_dossier = '' or v_pin = '' then
    return null;
  end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'tr:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select i.* into v_row
  from public.intervenants i
  where regexp_replace(lower(i.dossier), '[^a-z0-9]', '', 'g') = v_dossier and i.acces_terrain and i.pin_terrain is not null
    and i.pin_terrain = crypt(v_pin, i.pin_terrain)
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_row.id is not null);

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object('dossier', v_row.dossier, 'nom', v_row.nom, 'prenom', v_row.prenom);
end;
$function$;

create or replace function public._terrain_niveau(p_dossier text, p_pin text)
returns text
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_dossier text := regexp_replace(lower(coalesce(p_dossier, '')), '[^a-z0-9]', '', 'g');
  v_pin text := btrim(coalesce(p_pin, ''));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'tr:' || v_dossier;
  v_ok boolean;
begin
  if coalesce(public.is_admin('checkin'), false) then
    return 'admin';
  end if;

  if v_dossier = '' or v_pin = '' then
    raise exception 'Acces reserve';
  end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'tr:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.intervenants i
    where regexp_replace(lower(i.dossier), '[^a-z0-9]', '', 'g') = v_dossier and i.acces_terrain and i.pin_terrain is not null
      and i.pin_terrain = crypt(v_pin, i.pin_terrain)
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);

  if not v_ok then
    raise exception 'Acces reserve';
  end if;

  return 'limite';
end;
$function$;
