-- Membres de l'equipe COPAF (collaborateurs) : ils ont leur espace dans « Espace Intervenant » et
-- y voient en plus les boutons Guide du participant, Fiche de voyage, Programme et Attestation
-- (les fichiers correspondants sont deposes par l'admin dans leurs documents, avec le type voulu).
alter table public.intervenants add column if not exists equipe boolean not null default false;

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
    'equipe', v_row.equipe
  );
end;
$function$;
