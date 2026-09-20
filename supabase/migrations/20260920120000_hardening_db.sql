-- Durcissement base de donnees (audit securite de septembre 2026)
--
--  A) Statistiques du site (sessions / page_views / events) : plus de lecture ni de
--     modification publiques ; le navigateur passe par 2 fonctions dediees.
--  B) documents_intervenants : depot public limite a un intervenant existant et a
--     son propre dossier de stockage, date de creation imposee par la base.
--  C) public_upsert_contact : un visiteur ne peut plus ecraser un contact existant
--     (il ne peut que completer les champs vides) ; l'equipe garde l'ecrasement.
--  D) inscriptions / inscription_participants : les insertions publiques sont
--     normalisees (pas de statut "confirme", de facture, d'arrivee, de passeport...).
--  E) Suivi SG : la vue v_sg_inscriptions n'est plus lisible publiquement ; acces par
--     mot de passe verifie cote serveur (haché), avec verrouillage.
--  F) Limites de taille / type de fichier sur les buckets publics.
--  G) intervenant_login : verrouillage apres essais rates.

-- Equipe = toute personne listee dans admins
create or replace function public.is_staff()
returns boolean
language sql stable security definer
set search_path to 'public'
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- ───────────────────────── A) statistiques ─────────────────────────
drop policy if exists staff_select_sessions on public.sessions;
drop policy if exists staff_select_page_views on public.page_views;
drop policy if exists staff_select_events on public.events;
create policy staff_select_sessions on public.sessions for select to authenticated using (public.is_staff());
create policy staff_select_page_views on public.page_views for select to authenticated using (public.is_staff());
create policy staff_select_events on public.events for select to authenticated using (public.is_staff());

create or replace function public.analytics_track_view(
  p_session uuid, p_contact uuid, p_path text, p_referrer text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text
) returns uuid
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
begin
  if p_session is null or coalesce(btrim(p_path), '') = '' then return null; end if;
  if not exists (select 1 from public.sessions where id = p_session) then return null; end if;

  insert into public.page_views (session_id, contact_id, path, referrer, time_on_page, utm_source, utm_medium, utm_campaign)
  values (
    p_session,
    (select c.id from public.contacts c where c.id = p_contact),
    left(p_path, 300), left(p_referrer, 500), 0,
    left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 100)
  )
  returning id into v_id;

  update public.sessions set ended_at = now() where id = p_session;
  return v_id;
end;
$$;
grant execute on function public.analytics_track_view(uuid, uuid, text, text, text, text, text) to anon, authenticated;

create or replace function public.analytics_identify(p_session uuid, p_contact uuid)
returns void
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if p_session is null or p_contact is null then return; end if;
  if not exists (select 1 from public.contacts where id = p_contact) then return; end if;
  update public.sessions set contact_id = p_contact where id = p_session and contact_id is null;
end;
$$;
grant execute on function public.analytics_identify(uuid, uuid) to anon, authenticated;

-- ───────────────────────── B) documents_intervenants ─────────────────────────
create or replace function public.intervenant_dossier_existe(p_dossier text)
returns boolean
language sql stable security definer
set search_path to 'public'
as $$ select exists (select 1 from public.intervenants where dossier = p_dossier); $$;
grant execute on function public.intervenant_dossier_existe(text) to anon, authenticated;

drop policy if exists public_insert_documents_intervenants on public.documents_intervenants;
create policy public_insert_documents_intervenants on public.documents_intervenants
  for insert to anon, authenticated
  with check (
    public.intervenant_dossier_existe(documents_intervenants.dossier)
    and url like 'https://pdtohaxbsgpxccopgnmd.supabase.co/storage/v1/object/public/documents-intervenants/'
                 || documents_intervenants.dossier || '/%'
    and length(coalesce(label, '')) between 1 and 300
  );

create or replace function public.trg_documents_intervenants_public()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if auth.role() in ('anon', 'authenticated') and not public.is_staff() then
    new.created_at := now();
    new.visible := true;
    new.type := 'autre';
    new.ajoute_par := left(new.ajoute_par, 120);
  end if;
  return new;
end;
$$;
revoke execute on function public.trg_documents_intervenants_public() from public, anon, authenticated;
drop trigger if exists trg_documents_intervenants_public on public.documents_intervenants;
create trigger trg_documents_intervenants_public before insert on public.documents_intervenants
  for each row execute function public.trg_documents_intervenants_public();

-- ───────────────────────── C) public_upsert_contact ─────────────────────────
create or replace function public.public_upsert_contact(
  p_email text, p_source text, p_prenom text default null, p_nom text default null,
  p_telephone text default null, p_organisation text default null, p_poste text default null,
  p_pays text default null
) returns uuid
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
begin
  if p_email is null or trim(p_email) = '' then
    raise exception 'email requis';
  end if;

  if public.is_staff() then
    -- equipe : mise a jour complete (comportement d'origine)
    insert into public.contacts (email, prenom, nom, telephone, organisation, poste, pays, source)
    values (lower(trim(p_email)), p_prenom, p_nom, p_telephone, p_organisation, p_poste, p_pays, p_source)
    on conflict (email) do update set
      prenom       = coalesce(excluded.prenom, public.contacts.prenom),
      nom          = coalesce(excluded.nom, public.contacts.nom),
      telephone    = coalesce(excluded.telephone, public.contacts.telephone),
      organisation = coalesce(excluded.organisation, public.contacts.organisation),
      poste        = coalesce(excluded.poste, public.contacts.poste),
      pays         = coalesce(excluded.pays, public.contacts.pays),
      source       = coalesce(excluded.source, public.contacts.source),
      updated_at   = now()
    returning id into v_id;
  else
    -- public : un contact existant n'est jamais ecrase, seuls les champs vides sont completes
    insert into public.contacts (email, prenom, nom, telephone, organisation, poste, pays, source)
    values (lower(trim(p_email)), left(p_prenom, 100), left(p_nom, 100), left(p_telephone, 40), left(p_organisation, 200), left(p_poste, 200), left(p_pays, 100), left(p_source, 100))
    on conflict (email) do update set
      prenom       = coalesce(nullif(public.contacts.prenom, ''), excluded.prenom),
      nom          = coalesce(nullif(public.contacts.nom, ''), excluded.nom),
      telephone    = coalesce(nullif(public.contacts.telephone, ''), excluded.telephone),
      organisation = coalesce(nullif(public.contacts.organisation, ''), excluded.organisation),
      poste        = coalesce(nullif(public.contacts.poste, ''), excluded.poste),
      pays         = coalesce(nullif(public.contacts.pays, ''), excluded.pays),
      source       = coalesce(nullif(public.contacts.source, ''), excluded.source),
      updated_at   = now()
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

-- ───────────────────────── D) insertions publiques normalisees ─────────────────────────
create or replace function public.trg_inscriptions_public()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if auth.role() in ('anon', 'authenticated') and not public.is_staff() then
    if new.paiement_status is null or new.paiement_status not in ('reserve', 'en_attente') then
      new.paiement_status := 'en_attente';
    end if;
    new.badge_categorie := 'Participant';
    new.badge_url := null;
    new.arrived := false;
    new.arrived_at := null;
    new.checked_in_by := null;
    new.numero_facture := null;
    new.facture_definitive_date := null;
    new.note_interne := null;
    new.photo_url := null;
    new.numero_passeport := null;
    new.passeport_url := null;
    new.nom_passeport := null;
    new.prenom_passeport := null;
    new.espace_link_used := false;
    new.created_at := now();
  end if;
  return new;
end;
$$;
revoke execute on function public.trg_inscriptions_public() from public, anon, authenticated;
drop trigger if exists trg_00_inscriptions_public on public.inscriptions;
create trigger trg_00_inscriptions_public before insert on public.inscriptions
  for each row execute function public.trg_inscriptions_public();

create or replace function public.trg_inscription_participants_public()
returns trigger
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if auth.role() in ('anon', 'authenticated') and not public.is_staff() then
    new.badge_categorie := 'Participant';
    new.badge_url := null;
    new.arrived := false;
    new.arrived_at := null;
    new.checked_in_by := null;
    new.auth_user_id := null;
    new.photo_url := null;
    new.numero_passeport := null;
    new.passeport_url := null;
    new.nom_passeport := null;
    new.prenom_passeport := null;
    new.created_at := now();
  end if;
  return new;
end;
$$;
revoke execute on function public.trg_inscription_participants_public() from public, anon, authenticated;
drop trigger if exists trg_00_inscription_participants_public on public.inscription_participants;
create trigger trg_00_inscription_participants_public before insert on public.inscription_participants
  for each row execute function public.trg_inscription_participants_public();

-- ───────────────────────── E) suivi SG ─────────────────────────
create table if not exists public.sg_access (
  id int primary key default 1 check (id = 1),
  secret_hash text not null
);
alter table public.sg_access enable row level security;

create or replace function public._sg_verifier(p_password text)
returns boolean
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_ok boolean;
begin
  if (select count(*) from public.badge_login_attempts where cle = 'sg' and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle = 'sg' and not success and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.sg_access
    where secret_hash = extensions.crypt(coalesce(p_password, ''), secret_hash)
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values ('sg', v_ip, v_ok);
  return v_ok;
end;
$$;
revoke execute on function public._sg_verifier(text) from public, anon, authenticated;

create or replace function public.sg_connexion(p_password text)
returns boolean
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_ok boolean := public._sg_verifier(p_password);
begin
  if v_ok then perform public.public_log_sg_access(); end if;
  return v_ok;
end;
$$;
grant execute on function public.sg_connexion(text) to anon, authenticated;

create or replace function public.sg_inscriptions(p_password text)
returns table(pays text, nom text, prenom text, poste text)
language plpgsql security definer
set search_path to 'public'
as $$
begin
  if not public._sg_verifier(p_password) then
    raise exception 'Mot de passe incorrect';
  end if;
  return query select v.pays, v.nom, v.prenom, v.poste from public.v_sg_inscriptions v;
end;
$$;
grant execute on function public.sg_inscriptions(text) to anon, authenticated;

-- ───────────────────────── F) buckets ─────────────────────────
update storage.buckets set file_size_limit = 8 * 1024 * 1024,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  where id = 'badges-photos';
update storage.buckets set file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array['application/pdf']
  where id = 'documents-inscription';
update storage.buckets set file_size_limit = 30 * 1024 * 1024,
  allowed_mime_types = array[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  where id = 'documents-intervenants';
update storage.buckets set file_size_limit = 20 * 1024 * 1024 where id = 'documents-participants';
update storage.buckets set file_size_limit = 10 * 1024 * 1024,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  where id = 'preuves-paiement';

-- ───────────────────────── G) intervenant_login ─────────────────────────
create or replace function public.intervenant_login(p_nom text, p_code text, p_email text default null)
returns jsonb
language plpgsql security definer
set search_path to 'public'
as $$
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
    'interventions', v_row.interventions, 'badge_token', v_row.badge_token
  );
end;
$$;
