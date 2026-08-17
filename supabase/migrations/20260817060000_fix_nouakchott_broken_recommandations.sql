-- Reparation d'un diagnostic reel dont l'analyse IA a echoue silencieusement
-- (reponse tronquee par une limite de tokens trop basse, cf. fix dans
-- diagnostic-recommandations/index.ts) : le JSON casse avait ete sauvegarde
-- tel quel dans l'ancienne colonne texte `recommandations`, l'affichant en
-- brut sur le site. On la vide pour faire reapparaitre le bouton "Generer
-- mes recommandations" et permettre une nouvelle tentative avec la limite
-- de tokens corrigee.

update public.diagnostics
set recommandations = null
where organisation ilike '%Nouakchott%'
  and recommandations like '```json%';
