-- Jour 4 = album « présence des DG et SG »
alter table public.edition_photos drop constraint if exists edition_photos_jour_check;
alter table public.edition_photos add constraint edition_photos_jour_check check (jour between 1 and 4);
create unique index if not exists edition_photos_jour_ordre_uq on public.edition_photos (jour, ordre);
