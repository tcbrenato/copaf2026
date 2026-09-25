-- Ajoute le statut "prospect" : dossier cree pour generer une proforma
-- (ex. demarchage bancaire du DG) avant inscription officielle. Exclu de
-- tous les totaux/compteurs comme "annule", mais distinct visuellement pour
-- ne pas etre confondu avec une vraie annulation.
alter table public.inscriptions drop constraint inscriptions_paiement_status_check;
alter table public.inscriptions add constraint inscriptions_paiement_status_check
  check (paiement_status = any (array['en_attente', 'reserve', 'confirme', 'annule', 'prospect']));
