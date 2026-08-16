-- TEMPORAIRE — deux sondages de test (un public, un prive) pour verifier le
-- nouveau flux public/prive avant mise en prod. A retirer via une migration
-- de nettoyage juste apres verification (voir 20260816060000).

insert into public.sondages (session, question, options, actif, ordre, is_public)
values
  ('Test QA', 'Sondage de test PUBLIC — a supprimer', '["Option A", "Option B"]'::jsonb, true, 999, true),
  ('Test QA', 'Sondage de test PRIVE — a supprimer', '["Option A", "Option B"]'::jsonb, true, 1000, false);
