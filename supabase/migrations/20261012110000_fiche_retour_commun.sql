-- Transfert « hôtel → aéroport (retour) » : valeur commune à toutes les fiches (réglage du guide), comme la navette et le référent.
-- La fiche embarque désormais aussi retour_transfert dans ses valeurs communes (FR/EN), utilisée quand la fiche n'a pas la sienne.
create or replace function public._voyage_json(p_dossier text)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v public.voyages;
  p record;
  g public.guide_config;
  v_fiche jsonb := null;
begin
  select * into p from public._personne_dossier(p_dossier);
  select * into v from public.voyages where lower(dossier) = lower(p_dossier);
  select * into g from public.guide_config where id = 1;

  if v.statut in ('fiche_prete', 'fiche_envoyee') then
    v_fiche := jsonb_build_object(
      'hotel', v.hotel, 'hotel_adresse', v.hotel_adresse, 'hotel_confirmation', v.hotel_confirmation,
      'hotel_categorie', v.hotel_categorie, 'sejour', v.sejour, 'pickup', v.pickup,
      'chauffeur', v.chauffeur, 'retour_transfert', v.retour_transfert,
      'navette', v.navette, 'referent_nom', v.referent_nom, 'referent_tel', v.referent_tel,
      'commun', jsonb_build_object(
        'fr', jsonb_build_object('navette', g.valeurs->'fr'->>'navette', 'retour_transfert', g.valeurs->'fr'->>'retour_transfert', 'referent_nom', g.valeurs->'fr'->>'referent_nom', 'referent_tel', g.valeurs->'fr'->>'referent_tel'),
        'en', jsonb_build_object('navette', g.valeurs->'en'->>'navette', 'retour_transfert', g.valeurs->'en'->>'retour_transfert', 'referent_nom', g.valeurs->'en'->>'referent_nom', 'referent_tel', g.valeurs->'en'->>'referent_tel')
      )
    );
  end if;

  return jsonb_build_object(
    'dossier', p_dossier,
    'nom', p.nom, 'prenom', p.prenom, 'organisation', p.organisation, 'langue', coalesce(p.langue, 'fr'),
    'statut', coalesce(v.statut, 'aucun'),
    'vol_aller', v.vol_aller, 'vol_retour', v.vol_retour,
    'billet_depose', v.billet_path is not null,
    'fiche', v_fiche,
    'guide', case when g.publie then g.valeurs else null end
  );
end;
$function$;
revoke execute on function public._voyage_json(text) from public, anon, authenticated;

-- Réglages communs : transferts (heure indiquée à l'arrivée à l'hôtel ou par WhatsApp) et référents sur place
update public.guide_config set
  valeurs = jsonb_set(jsonb_set(valeurs,
    '{fr}', (valeurs->'fr') || jsonb_build_object(
      'navette', 'L''heure de départ vous sera indiquée à votre arrivée à l''hôtel',
      'retour_transfert', 'L''heure vous sera indiquée à votre arrivée à l''hôtel ou par WhatsApp',
      'referent_nom', 'Équipe COPAF : Fatima, Wiame, Rénato, Eliram',
      'referent_tel', 'Fatima +212 682-330720 · Wiame +212 623-699876 · Rénato (WhatsApp) +229 0169 30 30 19 · Eliram +1 (240) 854-3661',
      'contact_logistique', E'Fatima ES-BIA : +212 682-330720\nWiame LAGHA : +212 623-699876\nRénato TCHOBO (WhatsApp) : +229 0169 30 30 19\nEliram ODAH : +1 (240) 854-3661')),
    '{en}', (valeurs->'en') || jsonb_build_object(
      'navette', 'The departure time will be given to you when you arrive at the hotel',
      'retour_transfert', 'The time will be given to you when you arrive at the hotel, or via WhatsApp',
      'referent_nom', 'COPAF team: Fatima, Wiame, Rénato, Eliram',
      'referent_tel', 'Fatima +212 682-330720 · Wiame +212 623-699876 · Rénato (WhatsApp) +229 0169 30 30 19 · Eliram +1 (240) 854-3661',
      'contact_logistique', E'Fatima ES-BIA: +212 682-330720\nWiame LAGHA: +212 623-699876\nRénato TCHOBO (WhatsApp): +229 0169 30 30 19\nEliram ODAH: +1 (240) 854-3661')),
  updated_at = now()
where id = 1;
