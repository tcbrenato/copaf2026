-- Identification à deux niveaux (organisation -> site precis) pour le
-- Diagnostic Smart Port, + langue de reponse. Colonnes additives et
-- nullables : aucune donnee existante n'est modifiee ou perdue.
--
-- organisation / pays restent renseignes (texte affichable, retro-compatibles
-- avec l'admin existant). Les colonnes *_id ci-dessous referencent les
-- identifiants stables de src/utils/diagnosticOrganisations.js, utiles pour
-- grouper fiablement par organisation/reseau plus tard (moyennes regionales,
-- sessions collaboratives).

alter table public.diagnostics
  add column if not exists organisation_id text,
  add column if not exists site_id text,
  add column if not exists site_nom text,
  add column if not exists reseau text,
  add column if not exists langue text default 'fr';

comment on column public.diagnostics.organisation_id is 'id stable dans diagnosticOrganisations.js (ORGANISATIONS[].id), ou "autre" en saisie libre';
comment on column public.diagnostics.site_id is 'id du site precis (ORGANISATIONS[].sites[].id), null si organisation mono-site ou saisie libre';
comment on column public.diagnostics.site_nom is 'libelle du site tel qu affiche au moment de la soumission (fige, independant d une future modification du referentiel)';
comment on column public.diagnostics.reseau is 'agpaoc | pmaesa | uapna | associe | null (saisie libre)';
comment on column public.diagnostics.langue is 'fr | en — langue dans laquelle le repondant a rempli le diagnostic';
