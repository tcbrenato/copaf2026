-- Liens des albums photos de la conference, affiches dans les espaces personnels
-- avec les presentations (memes controles d'acces).

create table if not exists public.liens_conference (
  id uuid primary key default gen_random_uuid(),
  ordre int not null,
  titre_fr text not null,
  titre_en text not null,
  url text not null,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.liens_conference enable row level security;
create policy liens_conference_admin on public.liens_conference
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.liens_conference (ordre, titre_fr, titre_en, url) values
  (1, 'Photos : Jour 1', 'Photos: Day 1', 'https://photos.app.goo.gl/fjzZo9yKvkzvTRJX9'),
  (2, 'Photos : Jour 2', 'Photos: Day 2', 'https://photos.app.goo.gl/JsDJse28awQVwMeG7'),
  (3, 'Photos : Jour 3', 'Photos: Day 3', 'https://photos.app.goo.gl/rA38riHy3MMw32zc6'),
  (4, 'Photos : présence des DG et SG', 'Photos: attendance of Directors General and Secretaries General', 'https://photos.app.goo.gl/JhgoCG3JDZW7wyT69');

create or replace function public._espace_contenu_json()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'presentations', public._presentations_json(),
    'liens', coalesce((
      select jsonb_agg(jsonb_build_object('id', l.id, 'titre_fr', l.titre_fr, 'titre_en', l.titre_en, 'url', l.url) order by l.ordre)
      from public.liens_conference l where l.visible
    ), '[]'::jsonb)
  );
$$;
revoke all on function public._espace_contenu_json() from public, anon, authenticated;
create or replace function public.presentations_participant()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then return null; end if;
  if public.is_admin() or exists (
       select 1 from public.inscriptions i join public.contacts c on c.id = i.contact_id
       where c.auth_user_id = auth.uid() and coalesce(i.paiement_status, '') <> 'annule'
     ) or exists (
       select 1 from public.inscription_participants ip join public.inscriptions i on i.dossier = ip.dossier
       where ip.auth_user_id = auth.uid() and coalesce(i.paiement_status, '') <> 'annule'
     ) then
    return public._espace_contenu_json();
  end if;
  return null;
end;
$$;

create or replace function public.presentations_intervenant(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'pr:' || v_dossier;
  v_ok boolean;
begin
  if v_dossier = '' or v_email = '' then return null; end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'pr:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.intervenants i
    where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);
  if not v_ok then return null; end if;

  return public._espace_contenu_json();
end;
$$;
