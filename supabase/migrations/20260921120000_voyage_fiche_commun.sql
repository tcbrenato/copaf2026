-- La fiche de voyage embarque desormais les valeurs communes (navette hotel -> port, referent
-- sur place), pour que le participant puisse la generer meme si le guide n'est pas publie.
create or replace function public._voyage_json(p_dossier text)
returns jsonb
language plpgsql stable security definer
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
      'commun', jsonb_build_object(
        'fr', jsonb_build_object('navette', g.valeurs->'fr'->>'navette', 'referent_nom', g.valeurs->'fr'->>'referent_nom', 'referent_tel', g.valeurs->'fr'->>'referent_tel'),
        'en', jsonb_build_object('navette', g.valeurs->'en'->>'navette', 'referent_nom', g.valeurs->'en'->>'referent_nom', 'referent_tel', g.valeurs->'en'->>'referent_tel')
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
