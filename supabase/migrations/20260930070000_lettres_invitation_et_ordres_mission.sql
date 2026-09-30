-- Remplace l'ancien systeme unique "lettres_mission" (formulaire generique
-- comite/equipe/intervenant/autre) par deux tables specialisees, une par
-- document : lettres_invitation (intervenants) et ordres_mission (equipe
-- d'organisation). Chacune a son RPC public (meme schema de securite que
-- lettre_mission_public : dossier+email, verrou anti-bruteforce partage via
-- badge_login_attempts, ne retourne que les lignes "publie=true").

create table public.lettres_invitation (
  dossier text primary key,
  lieu text,
  date_lettre date,
  reference text,
  civilite text,
  prenom text,
  nom text not null,
  fonction text,
  institution text,
  ville_pays text,
  nationalite text,
  passeport text,
  sejour_debut date,
  sejour_fin date,
  publie boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_par text
);

alter table public.lettres_invitation enable row level security;

create policy admin_all_lettres_invitation on public.lettres_invitation
  for all to authenticated
  using (is_admin('all'))
  with check (is_admin('all'));

create table public.ordres_mission (
  dossier text primary key,
  civilite text,
  prenom text,
  nom text not null,
  fonction text,
  nationalite text,
  passeport text,
  depart date,
  retour date,
  lieu_signature text,
  date_signature date,
  publie boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_par text
);

alter table public.ordres_mission enable row level security;

create policy admin_all_ordres_mission on public.ordres_mission
  for all to authenticated
  using (is_admin('all'))
  with check (is_admin('all'));

create or replace function public.lettre_invitation_public(p_dossier text, p_email text)
returns table(
  dossier text, lieu text, date_lettre date, reference text, civilite text, prenom text, nom text,
  fonction text, institution text, ville_pays text, nationalite text, passeport text,
  sejour_debut date, sejour_fin date
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'li:' || v_dossier;
  v_ok boolean;
begin
  if v_dossier = '' or v_email = '' then
    return;
  end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'li:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.intervenants i
    where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);

  if not v_ok then
    return;
  end if;

  return query
    select li.dossier, li.lieu, li.date_lettre, li.reference, li.civilite, li.prenom, li.nom,
           li.fonction, li.institution, li.ville_pays, li.nationalite, li.passeport,
           li.sejour_debut, li.sejour_fin
    from public.lettres_invitation li
    where lower(li.dossier) = v_dossier and li.publie = true;
end;
$function$;

create or replace function public.ordre_mission_public(p_dossier text, p_email text)
returns table(
  dossier text, civilite text, prenom text, nom text, fonction text, nationalite text, passeport text,
  depart date, retour date, lieu_signature text, date_signature date
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'om:' || v_dossier;
  v_ok boolean;
begin
  if v_dossier = '' or v_email = '' then
    return;
  end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'om:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.intervenants i
    where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);

  if not v_ok then
    return;
  end if;

  return query
    select om.dossier, om.civilite, om.prenom, om.nom, om.fonction, om.nationalite, om.passeport,
           om.depart, om.retour, om.lieu_signature, om.date_signature
    from public.ordres_mission om
    where lower(om.dossier) = v_dossier and om.publie = true;
end;
$function$;

-- Migration des lignes reelles existantes de l'ancienne table (toutes
-- qualite='equipe') vers ordres_mission, avec les vraies coordonnees issues
-- de intervenants (nom/prenom proprement separes, plutot que le nom_libre
-- parfois compose). Sans effet si lettres_mission n'existe plus au moment
-- ou cette migration est rejouee (ex. reset complet de la base).
do $$
begin
  if to_regclass('public.lettres_mission') is not null then
    insert into public.ordres_mission (dossier, civilite, prenom, nom, fonction, nationalite, passeport, depart, retour, lieu_signature, date_signature, publie, updated_at)
    select
      lm.dossier,
      null,
      iv.prenom,
      iv.nom,
      coalesce(lm.fonction_libre, iv.fonction),
      case when iv.pays = 'Bénin' then 'Béninoise' else iv.pays end,
      iv.numero_passeport,
      lm.date_debut,
      lm.date_fin,
      lm.lieu_signature,
      coalesce(lm.genere_le::date, current_date),
      lm.statut in ('prete', 'envoyee'),
      lm.updated_at
    from public.lettres_mission lm
    join public.intervenants iv on lower(iv.dossier) = lower(lm.dossier)
    where lm.qualite = 'equipe'
    on conflict (dossier) do nothing;
  end if;
end $$;

-- Suppression de l'ancien systeme unique, remplace par les deux tables
-- specialisees ci-dessus.
drop function if exists public.lettre_mission_public(text, text);
drop table if exists public.lettres_mission;
