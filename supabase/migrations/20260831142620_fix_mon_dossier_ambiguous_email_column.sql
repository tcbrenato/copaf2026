-- Bugfix : le parametre de sortie "email" de RETURNS TABLE devient une variable
-- plpgsql implicite visible dans toute la fonction, en conflit avec la colonne
-- contacts.email dans l'UPDATE. On qualifie explicitement via un alias de table.
create or replace function public.mon_dossier()
 returns table(
   dossier text, statut text, prenom text, nom text, email text, telephone text,
   organisation text, poste text, pays text, participants integer, montant numeric,
   paiement_mode text, photo_url text, numero_facture text, date_inscription timestamptz,
   programme_personnalise jsonb, documents jsonb, infos_importantes jsonb
 )
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  update public.contacts as c
  set auth_user_id = auth.uid()
  where c.auth_user_id is null
    and auth.uid() is not null
    and lower(c.email) = lower(coalesce(auth.jwt()->>'email', ''));

  return query
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
    ), '[]'::jsonb),
    coalesce((
      select jsonb_agg(jsonb_build_object('id', n.id, 'contenu', n.contenu, 'created_at', n.created_at) order by n.created_at desc)
      from public.infos_importantes n
      where n.dossier = i.dossier or n.dossier is null
    ), '[]'::jsonb)
  from public.inscriptions i
  join public.contacts c on c.id = i.contact_id
  where c.auth_user_id = auth.uid()
  order by i.created_at desc
  limit 1;
end;
$function$;

revoke all on function public.mon_dossier() from public;
grant execute on function public.mon_dossier() to authenticated;
