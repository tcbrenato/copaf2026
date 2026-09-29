-- Acces terrain sans compte Supabase Auth : dossier + PIN (haché avec crypt,
-- meme convention que SG/Tirage/Badge). Vue bridee a la categorie
-- 'organisation' pour ces comptes (pas de compte Supabase Auth admin).

alter table public.intervenants
  add column acces_terrain boolean not null default false,
  add column pin_terrain text;

update public.intervenants set acces_terrain = true, pin_terrain = crypt('280473', gen_salt('bf')) where dossier = 'INT2026-008';
update public.intervenants set acces_terrain = true, pin_terrain = crypt('724609', gen_salt('bf')) where dossier = 'INT2026-009';
update public.intervenants set acces_terrain = true, pin_terrain = crypt('542420', gen_salt('bf')) where dossier = 'INT2026-010';
update public.intervenants set acces_terrain = true, pin_terrain = crypt('132476', gen_salt('bf')) where dossier = 'INT2026-011';
update public.intervenants set acces_terrain = true, pin_terrain = crypt('660394', gen_salt('bf')) where dossier = 'INT2026-012';

create or replace function public.terrain_login(p_dossier text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
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
  where lower(i.dossier) = v_dossier and i.acces_terrain and i.pin_terrain is not null
    and i.pin_terrain = crypt(v_pin, i.pin_terrain)
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_row.id is not null);

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object('dossier', v_row.dossier, 'nom', v_row.nom, 'prenom', v_row.prenom);
end;
$$;
revoke execute on function public.terrain_login(text, text) from public, anon;
grant execute on function public.terrain_login(text, text) to anon, authenticated;

-- Niveau d'acces pour les RPC terrain_* : 'admin' (compte Supabase Auth
-- scope checkin/all, voit tout), 'limite' (dossier+PIN valides, ne voit que
-- la categorie 'organisation'), ou exception si aucun des deux.
-- Reutilise le meme verrou anti-bruteforce que terrain_login (badge_login_attempts),
-- pas de verification "gratuite" non comptabilisee.
create or replace function public._terrain_niveau(p_dossier text, p_pin text)
returns text
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
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
    where lower(i.dossier) = v_dossier and i.acces_terrain and i.pin_terrain is not null
      and i.pin_terrain = crypt(v_pin, i.pin_terrain)
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);

  if not v_ok then
    raise exception 'Acces reserve';
  end if;

  return 'limite';
end;
$$;
revoke execute on function public._terrain_niveau(text, text) from public, anon, authenticated;
