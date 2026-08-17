-- Nettoyage des diagnostics de test crees dans 20260817000000, une fois la
-- verification du format structure (recommandations_v2) et du repli legacy
-- terminee.
delete from public.diagnostics where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
