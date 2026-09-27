-- lettre_mission_public : bascule en LEFT JOIN + coalesce vers les champs
-- "libre" (voir migration precedente), pour couvrir aussi les personnes
-- saisies directement dans le formulaire admin sans fiche intervenant.
create or replace function public.lettre_mission_public(p_dossier text)
returns table(
  dossier text, qualite text, qualite_autre text, role_attributions text,
  date_debut date, date_fin date, itineraire text,
  frais_transport boolean, frais_hebergement boolean, frais_restauration boolean, frais_transferts boolean,
  reference text, lieu_signature text,
  nom text, prenom text, fonction text, organisation text, pays text, numero_passeport text
)
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  return query
    select lm.dossier, lm.qualite, lm.qualite_autre, lm.role_attributions,
           lm.date_debut, lm.date_fin, lm.itineraire,
           lm.frais_transport, lm.frais_hebergement, lm.frais_restauration, lm.frais_transferts,
           lm.reference, lm.lieu_signature,
           coalesce(lm.nom_libre, iv.nom), coalesce(lm.prenom_libre, iv.prenom),
           coalesce(lm.fonction_libre, iv.fonction), coalesce(lm.organisation_libre, iv.organisation),
           iv.pays, iv.numero_passeport
    from public.lettres_mission lm
    left join public.intervenants iv on lower(iv.dossier) = lower(lm.dossier)
    where lower(lm.dossier) = lower(p_dossier) and lm.statut in ('prete', 'envoyee');
end;
$$;
