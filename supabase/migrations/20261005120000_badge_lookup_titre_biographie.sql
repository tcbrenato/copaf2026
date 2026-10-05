-- Badge public d'un membre de l'équipe : le titre professionnel remplace « Équipe d'organisation » sous le nom,
-- et la biographie (facultative) est proposée derrière un bouton. Les deux viennent de equipe_membres (onglet admin « Équipe »).
-- Nouvelles colonnes en fin de résultat : biographie, est_equipe.
drop function if exists public.badge_lookup(uuid);

create function public.badge_lookup(p_token uuid)
returns table(dossier text, nom text, prenom text, poste text, organisation text, categorie text, photo_url text, email text, telephone text, pays text, arrived boolean, arrived_at timestamptz, is_staff boolean, langue text, biographie text, est_equipe boolean)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_staff boolean := coalesce(public.is_admin('checkin'), false);
begin
  return query
  select
    i.dossier, c.nom, c.prenom, c.poste, c.organisation, i.badge_categorie,
    i.photo_url,
    case when v_staff then c.email end,
    case when v_staff then c.telephone end,
    c.pays,
    case when v_staff then i.arrived end,
    case when v_staff then i.arrived_at end,
    v_staff,
    coalesce(i.langue, 'fr'),
    null::text,
    false
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token
  union all
  select
    ip.dossier, ip.nom, ip.prenom, ip.poste, c.organisation, ip.badge_categorie,
    ip.photo_url,
    case when v_staff then ip.email end,
    case when v_staff then ip.telephone end,
    c.pays,
    case when v_staff then ip.arrived end,
    case when v_staff then ip.arrived_at end,
    v_staff,
    coalesce(ip.langue, 'fr'),
    null::text,
    false
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.badge_token = p_token
  union all
  select
    iv.dossier, iv.nom, iv.prenom,
    coalesce(nullif(btrim(em.titre), ''), iv.fonction),
    iv.organisation, 'Intervenant',
    iv.photo_url,
    iv.email,
    iv.telephone,
    iv.pays,
    case when v_staff then iv.arrived end,
    case when v_staff then iv.arrived_at end,
    v_staff,
    'fr',
    nullif(btrim(em.biographie), ''),
    (em.id is not null)
  from public.intervenants iv
  left join public.equipe_membres em on em.dossier = iv.dossier
  where iv.badge_token = p_token
  limit 1;
end;
$function$;

revoke execute on function public.badge_lookup(uuid) from public;
grant execute on function public.badge_lookup(uuid) to anon, authenticated;
