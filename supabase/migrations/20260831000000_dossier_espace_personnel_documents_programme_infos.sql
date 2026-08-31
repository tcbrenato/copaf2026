-- Espace personnel du participant : documents deposes par le secretariat,
-- programme personnalise, et bandeau d'infos importantes pilotes par l'admin.

create table if not exists public.documents_participants (
  id uuid primary key default gen_random_uuid(),
  dossier text not null references public.inscriptions(dossier) on delete cascade,
  type text not null default 'autre' check (type = any (array['recap','proforma','facture','badge','attestation','autre'])),
  label text not null,
  url text not null,
  visible boolean not null default true,
  ajoute_par text,
  created_at timestamptz not null default now()
);
create index if not exists documents_participants_dossier_idx on public.documents_participants(dossier);

alter table public.documents_participants enable row level security;

create policy admin_all_documents_participants on public.documents_participants
  for all
  to authenticated
  using (is_admin('proforma'))
  with check (is_admin('proforma'));

create table if not exists public.infos_importantes (
  id uuid primary key default gen_random_uuid(),
  dossier text references public.inscriptions(dossier) on delete cascade,
  contenu text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_par text
);
create index if not exists infos_importantes_dossier_idx on public.infos_importantes(dossier);

alter table public.infos_importantes enable row level security;

create policy admin_all_infos_importantes on public.infos_importantes
  for all
  to authenticated
  using (is_admin('proforma'))
  with check (is_admin('proforma'));

alter table public.inscriptions
  add column if not exists programme_personnalise jsonb;

drop function if exists public.suivi_dossier(text, text);

-- Espace personnel : renvoie en plus les documents visibles, les infos importantes
-- (globales + specifiques au dossier) et le programme personnalise eventuel.
create function public.suivi_dossier(p_dossier text, p_email text)
 returns table(
   dossier text, statut text, prenom text, nom text, email text, telephone text,
   organisation text, poste text, pays text, participants integer, montant numeric,
   paiement_mode text, photo_url text, numero_facture text, date_inscription timestamptz,
   programme_personnalise jsonb, documents jsonb, infos_importantes jsonb
 )
 language sql
 security definer
 set search_path to 'public'
as $function$
  select
    i.dossier,
    i.paiement_status as statut,
    c.prenom,
    c.nom,
    c.email,
    c.telephone,
    c.organisation,
    c.poste,
    c.pays,
    i.participants,
    i.montant,
    i.paiement_mode,
    i.photo_url,
    i.numero_facture,
    i.created_at as date_inscription,
    i.programme_personnalise,
    coalesce((
      select jsonb_agg(jsonb_build_object('id', d.id, 'type', d.type, 'label', d.label, 'url', d.url, 'created_at', d.created_at) order by d.created_at)
      from public.documents_participants d
      where d.dossier = i.dossier and d.visible = true
    ), '[]'::jsonb) as documents,
    coalesce((
      select jsonb_agg(jsonb_build_object('id', n.id, 'contenu', n.contenu, 'created_at', n.created_at) order by n.created_at desc)
      from public.infos_importantes n
      where n.dossier = i.dossier or n.dossier is null
    ), '[]'::jsonb) as infos_importantes
  from public.inscriptions i
  join public.contacts c on c.id = i.contact_id
  where i.dossier = p_dossier
    and lower(c.email) = lower(p_email)
  limit 1;
$function$;

-- Bucket public pour les fichiers deposes par le secretariat (badge scanne, attestation...)
insert into storage.buckets (id, name, public)
values ('documents-participants', 'documents-participants', true)
on conflict (id) do nothing;

create policy "Lecture publique documents participants"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'documents-participants');

create policy "Admin upload documents participants"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents-participants' and is_admin('proforma'));

create policy "Admin update documents participants"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents-participants' and is_admin('proforma'))
  with check (bucket_id = 'documents-participants' and is_admin('proforma'));

create policy "Admin delete documents participants"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents-participants' and is_admin('proforma'));
