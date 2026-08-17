-- TEMPORAIRE — diagnostic de test pour verifier le nouveau design (tableau
-- colore + masquage du plan d'action avant generation). A retirer apres
-- verification.

insert into public.diagnostics (id, nom, prenom, telephone, email, organisation, pays, scores, organisation_id, site_id, reseau, langue, recommandations_v2)
values (
  '44444444-4444-4444-4444-444444444444',
  'QA', 'Test', '+229000000', 'test-qa-design@example.com', 'Port de Test QA (design)', 'Bénin',
  '{"infrastructure":1,"automatisation":4,"tracabilite":2,"ia":3,"cybersecurite":1,"surete":4,"environnement":3,"synchromodalite":2,"competences":3,"parties_prenantes":4}'::jsonb,
  null, null, 'agpaoc', 'fr',
  '{
    "constatGeneral": "TEXTE DE TEST — constat general.",
    "analyseParAxe": {
      "infrastructure": "TEST — analyse infrastructure, un score faible qui devrait apparaitre en rouge.",
      "automatisation": "TEST — analyse automatisation, un score bon qui devrait apparaitre en vert.",
      "tracabilite": "TEST — analyse tracabilite, score faible en rouge.",
      "ia": "TEST — analyse IA, score moyen en orange.",
      "cybersecurite": "TEST — analyse cybersecurite, score tres faible en rouge.",
      "surete": "TEST — analyse surete, score bon en vert.",
      "environnement": "TEST — analyse environnement, score moyen en orange.",
      "synchromodalite": "TEST — analyse synchromodalite, score faible en rouge.",
      "competences": "TEST — analyse competences, score moyen en orange.",
      "parties_prenantes": "TEST — analyse parties prenantes, score bon en vert."
    },
    "recommandations": "TEXTE DE TEST — recommandations et plan action."
  }'::jsonb
);
