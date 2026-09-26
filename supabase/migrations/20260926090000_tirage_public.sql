-- Acces public au tirage au sort (page /tirage, poste de presentation sans
-- login admin), protege par un mot de passe operateur leger — meme
-- architecture que l'acces SG (SgGate.jsx / sg_connexion) : mot de passe
-- hache en base (jamais en clair dans le code), verifie cote serveur a
-- chaque appel, rate-limite via badge_login_attempts. La table
-- tirage_entrees ne contient que des noms (aucune donnee sensible) ; l'import
-- depuis les inscrits confirmes reste reserve a l'admin complet (preparation
-- en amont, hors direct).

create table public.tirage_access (
  id integer primary key default 1,
  secret_hash text not null,
  constraint tirage_access_singleton check (id = 1)
);

insert into public.tirage_access (id, secret_hash)
values (1, extensions.crypt('COPAF-TIRAGE-2026', extensions.gen_salt('bf')));

create or replace function public._tirage_verifier(p_password text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_ok boolean;
begin
  if (select count(*) from public.badge_login_attempts where cle = 'tirage' and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle = 'tirage' and not success and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.tirage_access
    where secret_hash = extensions.crypt(coalesce(p_password, ''), secret_hash)
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values ('tirage', v_ip, v_ok);
  return v_ok;
end;
$$;

create or replace function public.tirage_connexion(p_password text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  return public._tirage_verifier(p_password);
end;
$$;

create or replace function public.tirage_lister(p_password text)
returns table(id uuid, nom text)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public._tirage_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  return query select e.id, e.nom from public.tirage_entrees e where e.actif order by e.created_at asc;
end;
$$;

create or replace function public.tirage_ajouter(p_password text, p_nom text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public._tirage_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  if coalesce(trim(p_nom), '') = '' then return; end if;
  insert into public.tirage_entrees (nom) values (trim(p_nom));
end;
$$;

create or replace function public.tirage_ajouter_masse(p_password text, p_noms text[])
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public._tirage_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  insert into public.tirage_entrees (nom)
  select trim(n) from unnest(p_noms) as n where trim(coalesce(n, '')) <> '';
end;
$$;

create or replace function public.tirage_retirer(p_password text, p_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public._tirage_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  delete from public.tirage_entrees where id = p_id;
end;
$$;

create or replace function public.tirage_vider(p_password text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public._tirage_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  delete from public.tirage_entrees;
end;
$$;

revoke all on function public._tirage_verifier(text) from public, anon, authenticated;
grant execute on function public.tirage_connexion(text) to anon, authenticated;
grant execute on function public.tirage_lister(text) to anon, authenticated;
grant execute on function public.tirage_ajouter(text, text) to anon, authenticated;
grant execute on function public.tirage_ajouter_masse(text, text[]) to anon, authenticated;
grant execute on function public.tirage_retirer(text, uuid) to anon, authenticated;
grant execute on function public.tirage_vider(text) to anon, authenticated;

alter table public.tirage_access enable row level security;
-- Aucune policy : la table n'est lisible/modifiable que via les fonctions
-- SECURITY DEFINER ci-dessus (meme principe que sg_access).
