-- Reseautage avec consentement : annuaire des personnes presentes, demande de contact
-- WhatsApp, acceptation par la personne (depuis le mail, sans connexion). Ouvert 3 mois
-- (jusqu'au 2027-01-24). Les demandes et reponses passent par l'edge function `reseau`.

create table if not exists public.reseau_membres (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('participant', 'intervenant', 'invite')),
  ref_dossier text,
  prenom text,
  nom text not null,
  fonction text,
  organisation text,
  pays text,
  photo_url text,
  email text,
  telephone_suggere text,
  langue text not null default 'fr',
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique (type, ref_dossier)
);
alter table public.reseau_membres enable row level security;
create policy reseau_membres_admin on public.reseau_membres
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.reseau_demandes (
  id uuid primary key default gen_random_uuid(),
  demandeur_id uuid not null references public.reseau_membres(id) on delete cascade,
  cible_id uuid not null references public.reseau_membres(id) on delete cascade,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'acceptee', 'refusee')),
  token text not null unique,
  whatsapp_partage text,
  created_at timestamptz not null default now(),
  repondu_at timestamptz,
  expire_at timestamptz not null,
  unique (demandeur_id, cible_id)
);
alter table public.reseau_demandes enable row level security;
create policy reseau_demandes_admin on public.reseau_demandes
  for all using (public.is_admin()) with check (public.is_admin());

-- Amorcage : inscrits non annules (sauf les 3 absents NPA : NPA-02, NPA-03, NPA-04), intervenants, invite
insert into public.reseau_membres (type, ref_dossier, prenom, nom, fonction, organisation, pays, photo_url, email, telephone_suggere, langue)
select 'participant', i.dossier, c.prenom, c.nom, c.poste, coalesce(i.delegation_nom, c.organisation), c.pays, i.photo_url, c.email, c.telephone, coalesce(i.langue, 'fr')
from public.inscriptions i join public.contacts c on c.id = i.contact_id
where coalesce(i.paiement_status, '') <> 'annule'
on conflict (type, ref_dossier) do nothing;

insert into public.reseau_membres (type, ref_dossier, prenom, nom, fonction, organisation, pays, photo_url, email, telephone_suggere, langue)
select 'participant', ip.dossier, ip.prenom, ip.nom, ip.poste, coalesce(i.delegation_nom, c.organisation), c.pays, ip.photo_url, ip.email, coalesce(ip.whatsapp, ip.telephone), coalesce(ip.langue, 'fr')
from public.inscription_participants ip
join public.inscriptions i on i.id = ip.inscription_id
left join public.contacts c on c.id = i.contact_id
where coalesce(i.paiement_status, '') <> 'annule'
  and ip.dossier not in ('COPAF2026-NPA-02', 'COPAF2026-NPA-03', 'COPAF2026-NPA-04')
  and not exists (select 1 from public.contacts c2 where c2.id = i.contact_id and lower(c2.nom) = lower(ip.nom))
on conflict (type, ref_dossier) do nothing;

insert into public.reseau_membres (type, ref_dossier, prenom, nom, fonction, organisation, pays, photo_url, email, telephone_suggere, langue)
select 'intervenant', v.dossier, nullif(v.prenom, ''), v.nom, v.fonction, v.organisation, v.pays, v.photo_url, v.email, v.telephone, coalesce(v.langue, 'fr')
from public.intervenants v
where v.dossier not in ('INT2026-005', 'INT2026-006')
on conflict (type, ref_dossier) do nothing;

insert into public.reseau_membres (type, ref_dossier, prenom, nom, fonction, organisation, email, langue)
values ('invite', 'INVITE-KOFFI', 'Jean Marie', 'KOFFI', 'Secrétaire Général', 'AGPAOC', 'koffijeanmarie@yahoo.fr', 'fr')
on conflict (type, ref_dossier) do nothing;

create or replace function public._reseau_actif()
returns boolean language sql stable
as $$ select now() < timestamptz '2027-01-24 00:00:00+00' $$;

create or replace function public.reseau_moi_participant()
returns uuid
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare v uuid;
begin
  if auth.uid() is null then return null; end if;
  select m.id into v from public.reseau_membres m
  where m.type = 'participant' and (
    m.ref_dossier in (select ip.dossier from public.inscription_participants ip where ip.auth_user_id = auth.uid())
    or m.ref_dossier in (select i.dossier from public.inscriptions i join public.contacts c on c.id = i.contact_id where c.auth_user_id = auth.uid())
  )
  limit 1;
  return v;
end;
$$;
grant execute on function public.reseau_moi_participant() to authenticated;

create or replace function public.reseau_moi_intervenant(p_dossier text, p_email text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'rs:' || v_dossier;
  v_ok boolean;
  v_id uuid;
begin
  if v_dossier = '' or v_email = '' then return null; end if;
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'rs:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;
  select exists (select 1 from public.intervenants i where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email) into v_ok;
  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);
  if not v_ok then return null; end if;
  select m.id into v_id from public.reseau_membres m where m.type = 'intervenant' and lower(m.ref_dossier) = v_dossier;
  return v_id;
end;
$$;
grant execute on function public.reseau_moi_intervenant(text, text) to anon, authenticated;

create or replace function public._reseau_liste_json(p_moi uuid)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select jsonb_build_object(
    'actif', public._reseau_actif(),
    'moi', jsonb_build_object('id', p_moi, 'visible', (select visible from public.reseau_membres where id = p_moi)),
    'membres', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'type', m.type, 'prenom', m.prenom, 'nom', m.nom, 'fonction', m.fonction,
        'organisation', m.organisation, 'pays', m.pays, 'photo_url', m.photo_url,
        'joignable', m.email is not null,
        'statut', case when d.statut = 'en_attente' and d.expire_at < now() then 'expiree' else d.statut end,
        'whatsapp', case when d.statut = 'acceptee' then d.whatsapp_partage end
      ) order by m.nom, m.prenom)
      from public.reseau_membres m
      left join public.reseau_demandes d on d.demandeur_id = p_moi and d.cible_id = m.id
      where m.visible and m.id <> p_moi
    ), '[]'::jsonb)
  );
$$;
revoke all on function public._reseau_liste_json(uuid) from public, anon, authenticated;

create or replace function public.reseau_liste_participant()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare v uuid := public.reseau_moi_participant();
begin
  if v is null then return null; end if;
  return public._reseau_liste_json(v);
end;
$$;
grant execute on function public.reseau_liste_participant() to authenticated;

create or replace function public.reseau_liste_intervenant(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare v uuid := public.reseau_moi_intervenant(p_dossier, p_email);
begin
  if v is null then return null; end if;
  return public._reseau_liste_json(v);
end;
$$;
grant execute on function public.reseau_liste_intervenant(text, text) to anon, authenticated;

create or replace function public.reseau_visibilite_participant(p_visible boolean)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare v uuid := public.reseau_moi_participant();
begin
  if v is null then return null; end if;
  update public.reseau_membres set visible = p_visible where id = v;
  return p_visible;
end;
$$;
grant execute on function public.reseau_visibilite_participant(boolean) to authenticated;

create or replace function public.reseau_visibilite_intervenant(p_dossier text, p_email text, p_visible boolean)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare v uuid := public.reseau_moi_intervenant(p_dossier, p_email);
begin
  if v is null then return null; end if;
  update public.reseau_membres set visible = p_visible where id = v;
  return p_visible;
end;
$$;
grant execute on function public.reseau_visibilite_intervenant(text, text, boolean) to anon, authenticated;
