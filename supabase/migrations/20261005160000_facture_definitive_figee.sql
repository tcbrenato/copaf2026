-- Facture définitive figée : jusqu'ici elle était reconstruite à chaque téléchargement à partir du contact actuel
-- (nom, organisation, poste, pays, email), donc modifiable après émission. On enregistre désormais une copie des
-- données au moment de l'émission ; les écrans (admin > Proforma et espace participant) l'utilisent quand elle existe.
alter table public.inscriptions add column if not exists facture_snapshot jsonb;

-- FACT-2026-0002 (dossier COPAF2026-97200) : copie des données d'origine, prises AVANT le remplacement du contact.
-- (Seul ce dossier est figé ici : les autres factures émises restent calculées comme avant.)
update public.inscriptions i set facture_snapshot = jsonb_build_object(
  'form', jsonb_build_object('nom', c.nom, 'prenom', c.prenom, 'organisation', c.organisation, 'poste', c.poste, 'pays', c.pays, 'email', c.email),
  'nb', i.participants,
  'total', i.montant,
  'numero', i.numero_facture,
  'date_emission', i.facture_definitive_date,
  'figee_le', now()
)
from public.contacts c
where c.id = i.contact_id and i.dossier = 'COPAF2026-97200' and i.numero_facture = 'FACT-2026-0002' and i.facture_snapshot is null;

-- Lecture par le participant connecté (contact principal ou membre du dossier) de la copie de SA facture
create or replace function public.mon_facture(p_numero text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v jsonb;
begin
  if auth.uid() is null or coalesce(p_numero, '') = '' then
    return null;
  end if;

  select i.facture_snapshot into v
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where c.auth_user_id = auth.uid() and i.numero_facture = p_numero
  limit 1;

  if v is null then
    select i.facture_snapshot into v
    from public.inscription_participants ip join public.inscriptions i on i.id = ip.inscription_id
    where ip.auth_user_id = auth.uid() and i.numero_facture = p_numero
    limit 1;
  end if;

  return v;
end;
$function$;
revoke execute on function public.mon_facture(text) from public;
revoke execute on function public.mon_facture(text) from anon;
grant execute on function public.mon_facture(text) to authenticated;
