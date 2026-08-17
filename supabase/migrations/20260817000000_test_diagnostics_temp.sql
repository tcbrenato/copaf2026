-- TEMPORAIRE — deux diagnostics de test pour verifier le nouveau format
-- structure (recommandations_v2) et le repli sur l'ancien format texte.
-- A retirer via une migration de nettoyage juste apres verification.

insert into public.diagnostics (id, nom, prenom, telephone, email, organisation, pays, scores, organisation_id, site_id, reseau, langue)
values (
  '11111111-1111-1111-1111-111111111111',
  'QA', 'Test', '+229000000', 'test-qa-nouveau@example.com', 'Port de Test QA (nouveau format)', 'Bénin',
  '{"infrastructure":1,"automatisation":4,"tracabilite":2,"ia":3,"cybersecurite":1,"surete":4,"environnement":3,"synchromodalite":2,"competences":3,"parties_prenantes":4}'::jsonb,
  null, null, 'agpaoc', 'fr'
);

insert into public.diagnostics (id, nom, prenom, telephone, email, organisation, pays, scores, organisation_id, site_id, reseau, langue, recommandations)
values (
  '22222222-2222-2222-2222-222222222222',
  'QA', 'Test', '+229000000', 'test-qa-legacy@example.com', 'Port de Test QA (ancien format)', 'Bénin',
  '{"infrastructure":2,"automatisation":3,"tracabilite":2,"ia":2,"cybersecurite":3,"surete":3,"environnement":2,"synchromodalite":3,"competences":2,"parties_prenantes":3}'::jsonb,
  null, null, 'agpaoc', 'fr',
  'CONSTAT GENERAL : Ceci est un ancien texte de recommandations non structure, tel que genere avant la mise a jour du format. AXES PRIORITAIRES : exemple.'
);
