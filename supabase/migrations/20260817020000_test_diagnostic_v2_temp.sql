-- TEMPORAIRE — un diagnostic avec un recommandations_v2 deja rempli (pas
-- besoin de refaire un appel IA payant) pour verifier le regroupement en 2
-- blocs. A retirer via une migration de nettoyage juste apres verification.

insert into public.diagnostics (id, nom, prenom, telephone, email, organisation, pays, scores, organisation_id, site_id, reseau, langue, recommandations_v2)
values (
  '33333333-3333-3333-3333-333333333333',
  'QA', 'Test', '+229000000', 'test-qa-v2@example.com', 'Port de Test QA (regroupement 2 blocs)', 'Bénin',
  '{"infrastructure":1,"automatisation":4,"tracabilite":2,"ia":3,"cybersecurite":1,"surete":4,"environnement":3,"synchromodalite":2,"competences":3,"parties_prenantes":4}'::jsonb,
  null, null, 'agpaoc', 'fr',
  '{
    "constatGeneral": "TEXTE DE TEST — constat general factice pour verifier la mise en page.",
    "analyseParAxe": {
      "infrastructure": "TEST — analyse infrastructure.",
      "automatisation": "TEST — analyse automatisation.",
      "tracabilite": "TEST — analyse tracabilite.",
      "ia": "TEST — analyse IA.",
      "cybersecurite": "TEST — analyse cybersecurite.",
      "surete": "TEST — analyse surete.",
      "environnement": "TEST — analyse environnement.",
      "synchromodalite": "TEST — analyse synchromodalite.",
      "competences": "TEST — analyse competences.",
      "parties_prenantes": "TEST — analyse parties prenantes."
    },
    "recommandations": "TEXTE DE TEST — recommandations et plan d''action factices pour verifier la mise en page."
  }'::jsonb
);
