-- Bucket PRIVÉ pour les copies de passeport : aucune URL publique, lecture réservée à l'admin (liens signés temporaires).
-- Les dépôts se font par l'admin ; aucune policy d'écriture n'est laissée ouverte à anon.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('passeports', 'passeports', false, 8 * 1024 * 1024, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false;

drop policy if exists passeports_admin_select on storage.objects;
create policy passeports_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'passeports' and public.is_admin('all'));

drop policy if exists passeports_admin_ecriture on storage.objects;
create policy passeports_admin_ecriture on storage.objects for all to authenticated
  using (bucket_id = 'passeports' and public.is_admin('all'))
  with check (bucket_id = 'passeports' and public.is_admin('all'));
