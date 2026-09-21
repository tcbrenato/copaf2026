-- Guide du participant + fiche de voyage individuelle.
--
--  guide_config : champs du guide (identiques pour tous) saisis par l'admin, en FR et EN,
--                 + indicateur "publie" (le guide n'apparait dans l'espace participant que
--                 lorsque l'admin l'a publie).
--  voyages      : une ligne par dossier — vols saisis par la personne (via /badge),
--                 hotel/transferts saisis par l'admin, statut et dates d'envoi.
--  billets-avion: bucket PRIVE (depot anonyme sans lecture publique ; lecture admin).
--
-- Tout acces participant passe par des fonctions verifiant dossier + secret personnel
-- (comme /badge) ou la session connectee (/verifier). Aucune lecture publique directe.

create table if not exists public.guide_config (
  id int primary key default 1 check (id = 1),
  valeurs jsonb not null default '{"fr":{},"en":{}}'::jsonb,
  publie boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text
);
insert into public.guide_config (id) values (1) on conflict do nothing;
alter table public.guide_config enable row level security;
drop policy if exists admin_all_guide_config on public.guide_config;
create policy admin_all_guide_config on public.guide_config for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.voyages (
  dossier text primary key,
  vol_aller jsonb,
  vol_retour jsonb,
  billet_path text,
  hotel text, hotel_adresse text, hotel_confirmation text, hotel_categorie text, sejour text,
  pickup text, chauffeur text, retour_transfert text,
  statut text not null default 'aucun' check (statut in ('aucun', 'vols_recus', 'fiche_prete', 'fiche_envoyee')),
  vols_recus_le timestamptz,
  guide_envoye_le timestamptz,
  fiche_envoyee_le timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.voyages enable row level security;
drop policy if exists admin_all_voyages on public.voyages;
create policy admin_all_voyages on public.voyages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Personne d'un dossier (les 3 tables) : nom, prenom, organisation, langue, email
create or replace function public._personne_dossier(p_dossier text)
returns table(nom text, prenom text, organisation text, langue text, email text)
language plpgsql stable security definer
set search_path to 'public'
as $function$
begin
  return query
    select c.nom, c.prenom, c.organisation, coalesce(i.langue, 'fr'), c.email
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where lower(i.dossier) = lower(p_dossier)
    limit 1;
  if found then return; end if;
  return query
    select ip.nom, ip.prenom, c.organisation, coalesce(ip.langue, i.langue, 'fr'), ip.email
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where lower(ip.dossier) = lower(p_dossier)
    limit 1;
  if found then return; end if;
  return query
    select iv.nom, iv.prenom, iv.organisation, coalesce(iv.langue, 'fr'), iv.email
    from public.intervenants iv
    where lower(iv.dossier) = lower(p_dossier)
    limit 1;
end;
$function$;
revoke execute on function public._personne_dossier(text) from public, anon, authenticated;

-- Vue JSON de la situation voyage d'un dossier, telle que la personne a le droit de la voir :
-- ses vols toujours ; hotel/transferts seulement quand la fiche est prete ; le guide
-- seulement quand l'admin l'a publie.
create or replace function public._voyage_json(p_dossier text)
returns jsonb
language plpgsql stable security definer
set search_path to 'public'
as $function$
declare
  v public.voyages;
  p record;
  g public.guide_config;
  v_fiche jsonb := null;
begin
  select * into p from public._personne_dossier(p_dossier);
  select * into v from public.voyages where lower(dossier) = lower(p_dossier);
  select * into g from public.guide_config where id = 1;

  if v.statut in ('fiche_prete', 'fiche_envoyee') then
    v_fiche := jsonb_build_object(
      'hotel', v.hotel, 'hotel_adresse', v.hotel_adresse, 'hotel_confirmation', v.hotel_confirmation,
      'hotel_categorie', v.hotel_categorie, 'sejour', v.sejour, 'pickup', v.pickup,
      'chauffeur', v.chauffeur, 'retour_transfert', v.retour_transfert
    );
  end if;

  return jsonb_build_object(
    'dossier', p_dossier,
    'nom', p.nom, 'prenom', p.prenom, 'organisation', p.organisation, 'langue', coalesce(p.langue, 'fr'),
    'statut', coalesce(v.statut, 'aucun'),
    'vol_aller', v.vol_aller, 'vol_retour', v.vol_retour,
    'billet_depose', v.billet_path is not null,
    'fiche', v_fiche,
    'guide', case when g.publie then g.valeurs else null end
  );
end;
$function$;
revoke execute on function public._voyage_json(text) from public, anon, authenticated;

-- /badge : lecture (dossier + secret personnel)
create or replace function public.badge_voyage(p_dossier text, p_secret text)
returns jsonb
language plpgsql security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
begin
  select a.cible_id into v_id from public._badge_authentifier(p_dossier, p_secret) a;
  if v_id is null then return null; end if;
  return public._voyage_json(btrim(p_dossier));
end;
$function$;
grant execute on function public.badge_voyage(text, text) to anon, authenticated;

-- /badge : enregistrement des vols saisis par la personne
create or replace function public.badge_voyage_save(p_dossier text, p_secret text, p_aller jsonb, p_retour jsonb, p_billet text)
returns jsonb
language plpgsql security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_dossier text;
  v_aller jsonb;
  v_retour jsonb;
  v_billet text := nullif(btrim(coalesce(p_billet, '')), '');
  v_statut text;
  k text;
  x jsonb;
begin
  select a.cible_id into v_id from public._badge_authentifier(p_dossier, p_secret) a;
  if v_id is null then return null; end if;

  -- dossier tel qu'enregistre en base
  select coalesce(
    (select i.dossier from public.inscriptions i where lower(i.dossier) = lower(btrim(p_dossier))),
    (select ip.dossier from public.inscription_participants ip where lower(ip.dossier) = lower(btrim(p_dossier))),
    (select iv.dossier from public.intervenants iv where lower(iv.dossier) = lower(btrim(p_dossier)))
  ) into v_dossier;
  if v_dossier is null then return null; end if;

  foreach x in array array[coalesce(p_aller, '{}'::jsonb), coalesce(p_retour, '{}'::jsonb)] loop
    if jsonb_typeof(x) <> 'object' then raise exception 'Vol invalide'; end if;
    for k in select jsonb_object_keys(x) loop
      if k not in ('compagnie', 'numero', 'date', 'heure') then raise exception 'Champ inconnu'; end if;
      if jsonb_typeof(x->k) <> 'string' or length(x->>k) > 80 or (x->>k) ~ '[<>{}]' then raise exception 'Valeur invalide'; end if;
    end loop;
    if x ? 'date' and (x->>'date') <> '' and (x->>'date') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Date invalide'; end if;
    if x ? 'heure' and (x->>'heure') <> '' and (x->>'heure') !~ '^\d{1,2}[:hH]\d{2}$' then raise exception 'Heure invalide'; end if;
  end loop;
  v_aller := nullif(coalesce(p_aller, '{}'::jsonb), '{}'::jsonb);
  v_retour := nullif(coalesce(p_retour, '{}'::jsonb), '{}'::jsonb);

  if v_billet is not null and v_billet !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9._-]{1,80}$' then
    raise exception 'Billet invalide';
  end if;

  insert into public.voyages (dossier, vol_aller, vol_retour, billet_path, statut, vols_recus_le)
  values (v_dossier, v_aller, v_retour, v_billet,
          case when v_aller is not null or v_retour is not null or v_billet is not null then 'vols_recus' else 'aucun' end,
          case when v_aller is not null or v_retour is not null or v_billet is not null then now() end)
  on conflict (dossier) do update set
    vol_aller = coalesce(excluded.vol_aller, public.voyages.vol_aller),
    vol_retour = coalesce(excluded.vol_retour, public.voyages.vol_retour),
    billet_path = coalesce(excluded.billet_path, public.voyages.billet_path),
    statut = case when public.voyages.statut = 'aucun' and (excluded.vol_aller is not null or excluded.vol_retour is not null or excluded.billet_path is not null)
                  then 'vols_recus' else public.voyages.statut end,
    vols_recus_le = case when excluded.vol_aller is not null or excluded.vol_retour is not null or excluded.billet_path is not null
                         then now() else public.voyages.vols_recus_le end,
    updated_at = now()
  returning statut into v_statut;

  return public._voyage_json(v_dossier);
end;
$function$;
grant execute on function public.badge_voyage_save(text, text, jsonb, jsonb, text) to anon, authenticated;

-- /verifier : situation voyage de la personne connectee
create or replace function public.mon_voyage()
returns jsonb
language plpgsql security definer
set search_path to 'public'
as $function$
declare
  v_dossier text;
begin
  if auth.uid() is null then return null; end if;
  select x.dossier into v_dossier from (
    select i.dossier, i.created_at from public.inscriptions i join public.contacts c on c.id = i.contact_id where c.auth_user_id = auth.uid()
    union all
    select ip.dossier, ip.created_at from public.inscription_participants ip where ip.auth_user_id = auth.uid()
  ) x order by x.created_at desc limit 1;
  if v_dossier is null then return null; end if;
  return public._voyage_json(v_dossier);
end;
$function$;
revoke execute on function public.mon_voyage() from public, anon;
grant execute on function public.mon_voyage() to authenticated;

-- Billets d'avion : bucket prive. Depot par les visiteurs (chemin aleatoire, aucune lecture publique),
-- lecture reservee aux administrateurs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('billets-avion', 'billets-avion', false, 8 * 1024 * 1024,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists billets_avion_depot on storage.objects;
create policy billets_avion_depot on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'billets-avion');
drop policy if exists billets_avion_lecture_admin on storage.objects;
create policy billets_avion_lecture_admin on storage.objects for select to authenticated
  using (bucket_id = 'billets-avion' and public.is_admin());
