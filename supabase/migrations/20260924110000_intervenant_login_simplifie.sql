-- Desormais que chaque intervenant a un email fiable en base, la connexion se simplifie a
-- numero de dossier + email (comme /badge et /verifier), sans nom ni code d'acces separe. La
-- correspondance par nom approximatif + code etait un pis-aller pour les fiches encore incompletes ;
-- elle n'a plus lieu d'etre et etait plus fragile (orthographe, code a transmettre en plus).
drop function if exists public.intervenant_login(text, text, text);

create or replace function public.intervenant_login(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_row public.intervenants;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text;
begin
  if v_dossier = '' or v_email = '' then
    return null;
  end if;

  v_cle := 'iv:' || v_dossier;
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'iv:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select i.* into v_row
  from public.intervenants i
  where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email
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
