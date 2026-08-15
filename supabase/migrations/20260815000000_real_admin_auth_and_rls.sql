-- Level 2 : vraie protection admin (Supabase Auth) + RLS restrictive.
-- Remplace les mots de passe en clair (AdminGate) qui ne protegeaient pas
-- les donnees, par une authentification reelle + policies RLS par role.

-- ─── Table des comptes admin ──────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  scope      text not null check (scope in ('all','proforma','sondages','diagnostics')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admin_select_own_row" on public.admins;
create policy "admin_select_own_row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- ─── Fonction utilitaire : l'utilisateur connecte a-t-il le scope requis ? ──
create or replace function public.is_admin(required_scope text default 'all')
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
      and (scope = 'all' or scope = required_scope)
  );
$$;

grant execute on function public.is_admin(text) to authenticated;

-- ─── RPC : upsert contact public (remplace l'upsert direct sur "contacts") ──
create or replace function public.public_upsert_contact(
  p_email       text,
  p_source      text,
  p_prenom      text default null,
  p_nom         text default null,
  p_telephone   text default null,
  p_organisation text default null,
  p_poste       text default null,
  p_pays        text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_email is null or trim(p_email) = '' then
    raise exception 'email requis';
  end if;

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

  return v_id;
end;
$$;

grant execute on function public.public_upsert_contact(text,text,text,text,text,text,text,text) to anon, authenticated;

-- ─── RPC : recherche d'un contact pour l'auto-diagnostic (par dossier ou email) ──
create or replace function public.lookup_contact_for_diagnostic(
  p_dossier text default null,
  p_email   text default null
) returns table(id uuid, nom text, prenom text, organisation text, pays text, email text, telephone text)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.nom, c.prenom, c.organisation, c.pays, c.email, c.telephone
  from public.contacts c
  where
    (p_dossier is not null and c.id = (
      select i.contact_id from public.inscriptions i where i.dossier = p_dossier limit 1
    ))
    or (p_dossier is null and p_email is not null and c.email = lower(trim(p_email)))
  limit 1;
$$;

grant execute on function public.lookup_contact_for_diagnostic(text,text) to anon, authenticated;

-- ─── RPC : lecture d'un resultat de diagnostic par id (remplace le SELECT direct) ──
create or replace function public.get_diagnostic_result(p_id uuid)
returns setof public.diagnostics
language sql
security definer
set search_path = public
stable
as $$
  select * from public.diagnostics where id = p_id limit 1;
$$;

grant execute on function public.get_diagnostic_result(uuid) to anon, authenticated;

-- ─── contacts : plus aucun acces direct anon, uniquement via la RPC ci-dessus ──
drop policy if exists "insert_public" on public.contacts;
drop policy if exists "select_public" on public.contacts;
drop policy if exists "update_public" on public.contacts;

create policy "admin_select_contacts" on public.contacts
  for select to authenticated
  using (public.is_admin('proforma'));

-- ─── diagnostics : insertion publique (id genere cote client), lecture/suppression admin ──
drop policy if exists "Ecriture publique diagnostics" on public.diagnostics;
drop policy if exists "Lecture publique diagnostics" on public.diagnostics;
drop policy if exists "Mise a jour publique diagnostics" on public.diagnostics;
drop policy if exists "Suppression diagnostics" on public.diagnostics;

create policy "public_insert_diagnostics" on public.diagnostics
  for insert to anon, authenticated
  with check (true);

create policy "admin_select_diagnostics" on public.diagnostics
  for select to authenticated
  using (public.is_admin('diagnostics'));

create policy "admin_delete_diagnostics" on public.diagnostics
  for delete to authenticated
  using (public.is_admin('diagnostics'));

-- ─── documents_generes : reserve a l'admin proforma ──────────────────────────
drop policy if exists "Insertion publique documents_generes" on public.documents_generes;
drop policy if exists "Lecture publique documents_generes" on public.documents_generes;

create policy "admin_all_documents_generes" on public.documents_generes
  for all to authenticated
  using (public.is_admin('proforma'))
  with check (public.is_admin('proforma'));

-- ─── exposants : insertion publique, lecture/ecriture reservees a l'admin ────
drop policy if exists "allow insert exposants" on public.exposants;
drop policy if exists "allow select exposants" on public.exposants;
drop policy if exists "insert_public" on public.exposants;
drop policy if exists "select_public" on public.exposants;
drop policy if exists "update_public" on public.exposants;
drop policy if exists "write_admin" on public.exposants;

create policy "public_insert_exposants" on public.exposants
  for insert to anon, authenticated with check (true);
create policy "admin_select_exposants" on public.exposants
  for select to authenticated using (public.is_admin());
create policy "admin_update_exposants" on public.exposants
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_exposants" on public.exposants
  for delete to authenticated using (public.is_admin());

-- ─── inscriptions : insertion publique, lecture/ecriture admin+proforma ─────
drop policy if exists "insert_public" on public.inscriptions;
drop policy if exists "select_public" on public.inscriptions;
drop policy if exists "update_public" on public.inscriptions;
drop policy if exists "write_admin" on public.inscriptions;

create policy "public_insert_inscriptions" on public.inscriptions
  for insert to anon, authenticated with check (true);
create policy "admin_select_inscriptions" on public.inscriptions
  for select to authenticated using (public.is_admin('proforma'));
create policy "admin_update_inscriptions" on public.inscriptions
  for update to authenticated using (public.is_admin('proforma')) with check (public.is_admin('proforma'));
create policy "admin_delete_inscriptions" on public.inscriptions
  for delete to authenticated using (public.is_admin());

-- ─── sponsorships : insertion publique, lecture/ecriture admin ─────────────
drop policy if exists "insert_public" on public.sponsorships;
drop policy if exists "select_public" on public.sponsorships;
drop policy if exists "update_public" on public.sponsorships;
drop policy if exists "write_admin" on public.sponsorships;

create policy "public_insert_sponsorships" on public.sponsorships
  for insert to anon, authenticated with check (true);
create policy "admin_select_sponsorships" on public.sponsorships
  for select to authenticated using (public.is_admin());
create policy "admin_update_sponsorships" on public.sponsorships
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_sponsorships" on public.sponsorships
  for delete to authenticated using (public.is_admin());

-- ─── sondages : lecture publique conservee (vote live), ecriture admin ─────
drop policy if exists "Ecriture admin sondages" on public.sondages;
drop policy if exists "Suppression sondages" on public.sondages;

create policy "admin_insert_sondages" on public.sondages
  for insert to authenticated with check (public.is_admin('sondages'));
create policy "admin_update_sondages" on public.sondages
  for update to authenticated using (public.is_admin('sondages')) with check (public.is_admin('sondages'));
create policy "admin_delete_sondages" on public.sondages
  for delete to authenticated using (public.is_admin('sondages'));

-- ─── brochure_leads : nettoyage des policies dupliquees ─────────────────────
drop policy if exists "Allow public insert on brochure_leads" on public.brochure_leads;
drop policy if exists "Permettre l'insertion publique des leads brochure" on public.brochure_leads;
drop policy if exists "Public insert brochure leads" on public.brochure_leads;
drop policy if exists "Allow public select on brochure_leads" on public.brochure_leads;

create policy "public_insert_brochure_leads" on public.brochure_leads
  for insert to anon with check (true);
create policy "admin_select_brochure_leads" on public.brochure_leads
  for select to authenticated using (public.is_admin());

-- ─── events / page_views / sessions : reset analytics reserve a l'admin ────
drop policy if exists "admin_delete_events" on public.events;
create policy "admin_delete_events" on public.events
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin_delete_page_views" on public.page_views;
create policy "admin_delete_page_views" on public.page_views
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin_delete_sessions" on public.sessions;
create policy "admin_delete_sessions" on public.sessions
  for delete to authenticated using (public.is_admin());

-- ─── tables orphelines sans RLS activee : on l'active, admin seulement ──────
alter table public.inscription_participants enable row level security;
drop policy if exists "admin_all_inscription_participants" on public.inscription_participants;
create policy "admin_all_inscription_participants" on public.inscription_participants
  for all to authenticated
  using (public.is_admin('proforma'))
  with check (public.is_admin('proforma'));

alter table public.inscriptions_backup_doublons enable row level security;
drop policy if exists "admin_select_inscriptions_backup_doublons" on public.inscriptions_backup_doublons;
create policy "admin_select_inscriptions_backup_doublons" on public.inscriptions_backup_doublons
  for select to authenticated using (public.is_admin());

-- ─── vues analytiques SECURITY DEFINER : reservees aux comptes authentifies ──
revoke all on public.v_inscriptions_daily from public, anon;
revoke all on public.v_top_pages        from public, anon;
revoke all on public.v_funnel           from public, anon;
revoke all on public.v_revenus_sources  from public, anon;
grant select on public.v_inscriptions_daily to authenticated;
grant select on public.v_top_pages        to authenticated;
grant select on public.v_funnel           to authenticated;
grant select on public.v_revenus_sources  to authenticated;

-- ─── fonction de numerotation facture : reservee aux comptes authentifies ───
revoke execute on function public.next_numero_facture() from public, anon;
grant execute on function public.next_numero_facture() to authenticated;

-- ─── durcissement search_path (avertissements de l'advisor Supabase) ───────
alter function public.update_updated_at() set search_path = public;
alter function public.next_numero_facture() set search_path = public;
