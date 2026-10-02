-- Fiche d'une personne pour l'accueil (scan ou recherche) : identite + etapes terrain
-- deja faites (presence = jour courant seulement) + numeros de tablettes deja attribues,
-- pour afficher les boutons d'action sans repasser par la liste Terrain complete.
-- Acces : meme controle que badge_checkin / staff_search (_terrain_niveau).
create or replace function public.staff_fiche(p_token uuid, p_dossier text default null, p_pin text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_niveau text := public._terrain_niveau(p_dossier, p_pin);
  v_jour date := (now() at time zone 'Africa/Casablanca')::date;
  v_pt text; v_cat text; v_dossier text; v_nom text; v_prenom text; v_org text; v_poste text; v_photo text;
  v_etapes jsonb; v_prises jsonb;
begin
  select i.dossier, c.nom, c.prenom, c.organisation, c.poste, i.photo_url
  into v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where i.badge_token = p_token;

  if found then
    v_pt := 'inscription'; v_cat := 'participant';
  else
    select ip.dossier, ip.nom, ip.prenom, c.organisation, ip.poste, ip.photo_url
    into v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where ip.badge_token = p_token;

    if found then
      v_pt := 'participant_groupe'; v_cat := 'participant';
    else
      select iv.dossier, iv.nom, iv.prenom, iv.organisation, iv.fonction, iv.photo_url,
             case when iv.equipe then 'equipe' else 'intervenant' end,
             case when iv.equipe then 'organisation' else 'intervenant' end
      into v_dossier, v_nom, v_prenom, v_org, v_poste, v_photo, v_pt, v_cat
      from public.intervenants iv
      where iv.badge_token = p_token;

      if not found then
        raise exception 'Badge introuvable';
      end if;
    end if;
  end if;

  select coalesce(jsonb_object_agg(st.etape, jsonb_build_object('id', st.id, 'fait_le', st.fait_le, 'fait_par', st.fait_par, 'valeur', st.valeur)), '{}'::jsonb)
  into v_etapes
  from public.suivi_terrain st
  where st.personne_type = v_pt and st.personne_id = v_dossier and st.annule_le is null
    and (st.etape <> 'present' or st.jour = v_jour);

  select coalesce(jsonb_object_agg(upper(regexp_replace(st.valeur, '\s+', '', 'g')), st.personne_id), '{}'::jsonb)
  into v_prises
  from public.suivi_terrain st
  where st.etape = 'tablette' and st.annule_le is null and st.valeur is not null
    and not (st.personne_type = v_pt and st.personne_id = v_dossier);

  return jsonb_build_object(
    'personne_type', v_pt, 'personne_id', v_dossier, 'dossier', v_dossier, 'categorie', v_cat,
    'nom', v_nom, 'prenom', v_prenom, 'organisation', v_org, 'poste', v_poste, 'photo_url', v_photo,
    'etapes', v_etapes, 'tablettes_prises', v_prises
  );
end;
$$;
revoke execute on function public.staff_fiche(uuid, text, text) from public;
grant execute on function public.staff_fiche(uuid, text, text) to anon, authenticated;
