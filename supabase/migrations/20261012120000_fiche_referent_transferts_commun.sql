-- Le « Référent » de la section « Vos transferts » de la fiche (champ chauffeur) devient lui aussi une valeur commune :
-- même contact pour tous (Fatima et Wiame, numéros marocains), modifiable fiche par fiche.
-- Le bloc « En cas de besoin sur place » (referent_nom / referent_tel) porte Rénato et Eliram (WhatsApp / international).
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
        'fr', jsonb_build_object('navette', g.valeurs->'fr'->>'navette', 'retour_transfert', g.valeurs->'fr'->>'retour_transfert', 'chauffeur', g.valeurs->'fr'->>'chauffeur', 'referent_nom', g.valeurs->'fr'->>'referent_nom', 'referent_tel', g.valeurs->'fr'->>'referent_tel'),
        'en', jsonb_build_object('navette', g.valeurs->'en'->>'navette', 'retour_transfert', g.valeurs->'en'->>'retour_transfert', 'chauffeur', g.valeurs->'en'->>'chauffeur', 'referent_nom', g.valeurs->'en'->>'referent_nom', 'referent_tel', g.valeurs->'en'->>'referent_tel')
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

update public.guide_config set
  valeurs = jsonb_set(jsonb_set(valeurs,
    '{fr}', (valeurs->'fr') || jsonb_build_object(
      'chauffeur', 'Fatima +212 682-330720 · Wiame +212 623-699876',
      'referent_nom', 'Équipe COPAF : Rénato, Eliram',
      'referent_tel', 'Rénato (WhatsApp) +229 0169 30 30 19 · Eliram +1 (240) 854-3661')),
    '{en}', (valeurs->'en') || jsonb_build_object(
      'chauffeur', 'Fatima +212 682-330720 · Wiame +212 623-699876',
      'referent_nom', 'COPAF team: Rénato, Eliram',
      'referent_tel', 'Rénato (WhatsApp) +229 0169 30 30 19 · Eliram +1 (240) 854-3661')),
  updated_at = now()
where id = 1;
