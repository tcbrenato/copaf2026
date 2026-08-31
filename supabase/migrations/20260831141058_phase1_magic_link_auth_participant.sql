-- Phase 1 : authentification par lien magique pour l'espace personnel du participant.
-- Le contact existant (cree a l'inscription publique) est rattache a un auth.users
-- au premier appel authentifie de mon_dossier(), par correspondance d'email.

alter table public.contacts
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists contacts_auth_user_id_key
  on public.contacts(auth_user_id) where auth_user_id is not null;

-- Verifie si le compte connecte est proprietaire d'un dossier donne (reutilisable par de futures policies RLS).
create or replace function public.owns_dossier(p_dossier text)
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.inscriptions i
    join public.contacts c on c.id = i.contact_id
    where i.dossier = p_dossier and c.auth_user_id = auth.uid()
  );
$function$;

revoke all on function public.owns_dossier(text) from public;
grant execute on function public.owns_dossier(text) to authenticated;

-- Espace personnel authentifie : plus besoin de ressaisir le dossier ou l'email,
-- tout est derive de la session (auth.uid()). Rattache paresseusement le contact
-- existant au compte auth au premier appel si ce n'est pas deja fait.
create or replace function public.mon_dossier()
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
  with linked as (
    update public.contacts
    set auth_user_id = auth.uid()
    where auth_user_id is null
      and auth.uid() is not null
      and lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    returning id
  )
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
  where c.auth_user_id = auth.uid()
  order by i.created_at desc
  limit 1;
$function$;

revoke all on function public.mon_dossier() from public;
grant execute on function public.mon_dossier() to authenticated;
