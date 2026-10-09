-- La liste admin des tablettes renvoie aussi l'étiquette du lien (ex. « T07 · Prénom NOM » : numéro de tablette + participant).
drop function if exists public.admin_tablette_liste();

create function public.admin_tablette_liste()
returns table(
  personne_type text, personne_id text, dossier text, prenom text, nom text, organisation text, pays text,
  categorie text, statut_dossier text,
  token_id uuid, token_cree_le timestamptz, token_expire_le timestamptz, token_revoque_le timestamptz,
  derniere_utilisation timestamptz, utilisations integer, sessions_actives integer, token_label text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
begin
  if not coalesce(public.is_admin('all'), false) then
    raise exception 'Acces reserve';
  end if;

  return query
  with personnes as (
    select 'inscription'::text as personne_type, i.dossier as personne_id, i.dossier, c.prenom, c.nom, c.organisation, c.pays,
           'participant'::text as categorie,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end) as statut_dossier
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select 'participant_groupe', ip.dossier, ip.dossier, ip.prenom, ip.nom, c.organisation, c.pays, 'participant',
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end)
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select (case when iv.equipe then 'equipe' else 'intervenant' end), iv.dossier, iv.dossier, iv.prenom, iv.nom, iv.organisation, iv.pays,
           (case when iv.equipe then 'organisation' else 'intervenant' end), null
    from public.intervenants iv
  )
  select p.personne_type, p.personne_id, p.dossier, p.prenom, p.nom, p.organisation, p.pays, p.categorie, p.statut_dossier,
         t.id, t.created_at, t.expires_at, t.revoked_at, t.last_used_at, coalesce(t.usage_count, 0),
         coalesce((select count(*)::int from public.tablet_sessions s where s.token_id = t.id and s.expires_at > now()), 0),
         t.label
  from personnes p
  left join lateral (
    select * from public.tablet_tokens tt
    where tt.personne_type = p.personne_type and tt.personne_id = p.personne_id
    order by tt.created_at desc limit 1
  ) t on true
  order by p.nom, p.prenom;
end;
$$;

revoke execute on function public.admin_tablette_liste() from public, anon;
grant execute on function public.admin_tablette_liste() to authenticated;
