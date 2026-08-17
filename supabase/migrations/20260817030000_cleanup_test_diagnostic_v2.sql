-- Nettoyage du diagnostic de test cree dans 20260817020000, une fois la
-- verification du regroupement en 2 blocs terminee.
delete from public.diagnostics where id = '33333333-3333-3333-3333-333333333333';
