-- Securite : plus de listing anonyme des fichiers.
--
-- Les 4 buckets ci-dessous sont PUBLICS (les liens directs /object/public/...
-- fonctionnent sans aucune regle RLS), mais les regles SELECT anonymes
-- permettaient en plus de LISTER tous les fichiers (passeports, photos,
-- attestations, proformas...) via l'API storage. On les retire : les liens
-- deja envoyes continuent de marcher, mais les fichiers ne sont plus
-- enumerables. Les admins gardent la lecture via des regles dediees.
--
-- ROLLBACK (retablit l'etat precedent) :
--   create policy "Lecture publique documents intervenants" on storage.objects for select to anon, authenticated using (bucket_id = 'documents-intervenants');
--   create policy "Lecture publique documents participants" on storage.objects for select to anon, authenticated using (bucket_id = 'documents-participants');
--   create policy "Lecture publique photos badges" on storage.objects for select to anon using (bucket_id = 'badges-photos');
--   create policy "Public read documents inscription" on storage.objects for select to anon, authenticated using (bucket_id = 'documents-inscription');

drop policy if exists "Lecture publique documents intervenants" on storage.objects;
drop policy if exists "Lecture publique documents participants" on storage.objects;
drop policy if exists "Lecture publique photos badges" on storage.objects;
drop policy if exists "Public read documents inscription" on storage.objects;

-- badges-photos, documents-intervenants et preuves-paiement ont deja une regle
-- "ALL" reservee aux admins ; documents-participants n'avait que
-- insert/update/delete admin, et documents-inscription aucune regle admin.
create policy "Admin lit documents participants" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents-participants' and is_admin('proforma'));

create policy "Admin lit documents inscription" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents-inscription' and is_admin('proforma'));
