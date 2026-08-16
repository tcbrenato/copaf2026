-- Nettoyage des sondages de test crees dans 20260816050000, et de leurs
-- votes de test associes, une fois la verification du flux public/prive
-- terminee.

delete from public.votes
where sondage_id in (
  select id from public.sondages where session = 'Test QA'
);

delete from public.sondages where session = 'Test QA';
