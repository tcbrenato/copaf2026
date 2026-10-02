-- Un dossier saisi sans tiret (ex. INT2026008) etait accepte par la connexion et
-- _terrain_niveau, mais la recherche de l'auteur (prenom) comparait le dossier
-- brut -> fait_par NULL -> « Badge introuvable » au scan et echec des etapes.
-- On aligne la recherche sur la meme normalisation (non alphanumeriques retires).
do $$
declare r record; d text;
begin
  for r in
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('badge_checkin', 'terrain_marquer', 'terrain_marquer_groupe', 'terrain_annuler', 'terrain_incident_creer', 'terrain_incident_resoudre')
      and pg_get_functiondef(p.oid) ~ 'lower\((iv2\.)?dossier\) = lower\(p_dossier\)'
  loop
    d := regexp_replace(
      pg_get_functiondef(r.oid),
      'lower\(((?:iv2\.)?dossier)\) = lower\(p_dossier\)',
      'regexp_replace(lower(\1), ''[^a-z0-9]'', '''', ''g'') = regexp_replace(lower(p_dossier), ''[^a-z0-9]'', '''', ''g'')',
      'g'
    );
    execute d;
  end loop;
end $$;
