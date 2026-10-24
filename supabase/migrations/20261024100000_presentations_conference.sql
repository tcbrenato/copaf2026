-- Presentations de la conference : visibles uniquement depuis l'espace personnel
-- (participants connectes, intervenants dossier + email). Pas de page publique ;
-- les autres personnes passent par la demande (edge function demande-presentations).

insert into storage.buckets (id, name, public, file_size_limit)
values ('presentations', 'presentations', true, 52428800)
on conflict (id) do nothing;

create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  ordre int not null,
  jour int,
  intervenant text,
  titre_fr text not null,
  titre_en text not null,
  fichier_fr text,
  fichier_en text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.presentations enable row level security;
create policy presentations_admin on public.presentations
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.demandes_presentations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  organisation text,
  pays text,
  message text,
  langue text,
  traite boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.demandes_presentations enable row level security;
create policy demandes_presentations_admin on public.demandes_presentations
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public._presentations_json()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'ordre', p.ordre, 'jour', p.jour, 'intervenant', p.intervenant,
    'titre_fr', p.titre_fr, 'titre_en', p.titre_en,
    'url_fr', case when p.fichier_fr is null then null else 'https://pdtohaxbsgpxccopgnmd.supabase.co/storage/v1/object/public/presentations/' || p.fichier_fr end,
    'url_en', case when p.fichier_en is null then null else 'https://pdtohaxbsgpxccopgnmd.supabase.co/storage/v1/object/public/presentations/' || p.fichier_en end
  ) order by p.ordre), '[]'::jsonb)
  from public.presentations p where p.visible;
$$;
revoke all on function public._presentations_json() from public, anon, authenticated;

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
    return public._presentations_json();
  end if;
  return null;
end;
$$;
grant execute on function public.presentations_participant() to authenticated;

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

  return public._presentations_json();
end;
$$;
grant execute on function public.presentations_intervenant(text, text) to anon, authenticated;
