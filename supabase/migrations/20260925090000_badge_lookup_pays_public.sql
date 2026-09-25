-- Le pays devient public pour les participants/delegues aussi (deja le cas pour les intervenants) :
-- necessaire pour afficher le drapeau sur la carte publique du QR code. Toujours pas d'email,
-- telephone ni statut de presence, qui restent reserves au staff.
create or replace function public.badge_lookup(p_token uuid)
returns table(dossier text, nom text, prenom text, poste text, organisation text, categorie text, photo_url text, email text, telephone text, pays text, arrived boolean, arrived_at timestamptz, is_staff boolean, langue text)
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
    coalesce(i.langue, 'fr')
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
    coalesce(ip.langue, 'fr')
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where ip.badge_token = p_token
  union all
  select
    iv.dossier, iv.nom, iv.prenom, iv.fonction, iv.organisation, 'Intervenant',
    iv.photo_url,
    iv.email,
    iv.telephone,
    iv.pays,
    case when v_staff then iv.arrived end,
    case when v_staff then iv.arrived_at end,
    v_staff,
    'fr'
  from public.intervenants iv
  where iv.badge_token = p_token
  limit 1;
end;
$function$;
