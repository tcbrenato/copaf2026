-- Le DG veut que le raisonnement genere par l'IA suive strictement 3 etapes
-- distinctes (constat -> analyse par axe -> recommandations/plan d'action),
-- et que le PDF telechargeable reflete la meme structure en sections
-- clairement delimitees, plutot qu'un seul bloc de texte libre.
--
-- Nouvelle colonne jsonb en complement de l'ancienne colonne texte
-- `recommandations` (conservee telle quelle) : les diagnostics deja generes
-- avant ce changement continuent d'afficher l'ancien format sans
-- regeneration forcee ; seuls les nouveaux utilisent la structure ci-dessous.
--
-- Forme attendue :
-- {
--   "constatGeneral": "...",
--   "analyseParAxe": { "infrastructure": "...", "automatisation": "...", ... },
--   "recommandations": "..."
-- }

alter table public.diagnostics add column if not exists recommandations_v2 jsonb;
