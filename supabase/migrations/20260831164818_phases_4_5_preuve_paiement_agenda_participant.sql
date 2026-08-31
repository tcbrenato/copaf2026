-- Phase 4 : preuve de virement televersable par le participant, validee par le secretariat.
create table if not exists public.preuves_paiement (
  id uuid primary key default gen_random_uuid(),
  dossier text not null references public.inscriptions(dossier) on delete cascade,
  url text not null,
  statut text not null default 'en_attente' check (statut = any (array['en_attente','validee','rejetee'])),
  commentaire_admin text,
  valide_par text,
  valide_le timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists preuves_paiement_dossier_idx on public.preuves_paiement(dossier);

alter table public.preuves_paiement enable row level security;

create policy participant_insert_preuve on public.preuves_paiement
  for insert to authenticated
  with check (public.owns_dossier(dossier));

create policy participant_select_preuve on public.preuves_paiement
  for select to authenticated
  using (public.owns_dossier(dossier));

create policy admin_all_preuve on public.preuves_paiement
  for all to authenticated
  using (is_admin('proforma'))
  with check (is_admin('proforma'));

-- Bucket prive (les preuves de virement peuvent reveler des donnees bancaires) :
-- acces uniquement via URL signee, jamais public.
insert into storage.buckets (id, name, public)
values ('preuves-paiement', 'preuves-paiement', false)
on conflict (id) do nothing;

create policy "Participant upload sa preuve de virement"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'preuves-paiement' and public.owns_dossier((storage.foldername(name))[1]));

create policy "Participant et admin lisent les preuves de virement"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'preuves-paiement' and (public.owns_dossier((storage.foldername(name))[1]) or is_admin('proforma')));

create policy "Admin gere les preuves de virement"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'preuves-paiement' and is_admin('proforma'))
  with check (bucket_id = 'preuves-paiement' and is_admin('proforma'));

-- Phase 5 : agenda personnalise en libre-service (remplace programme_personnalise,
-- qui etait pilote uniquement par le secretariat et n'a jamais ete utilise en prod).
create table if not exists public.agenda_participant (
  id uuid primary key default gen_random_uuid(),
  dossier text not null references public.inscriptions(dossier) on delete cascade,
  session_key text not null,
  jour text not null,
  heure text not null,
  titre text not null,
  created_at timestamptz not null default now(),
  unique (dossier, session_key)
);
create index if not exists agenda_participant_dossier_idx on public.agenda_participant(dossier);

alter table public.agenda_participant enable row level security;

create policy participant_manage_agenda on public.agenda_participant
  for all to authenticated
  using (public.owns_dossier(dossier))
  with check (public.owns_dossier(dossier));

create policy admin_select_agenda on public.agenda_participant
  for select to authenticated
  using (is_admin('proforma'));

alter table public.inscriptions drop column if exists programme_personnalise;
