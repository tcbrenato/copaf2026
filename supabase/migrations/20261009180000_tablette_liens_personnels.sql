-- Connexion automatique des tablettes par lien personnel permanent (https://copaf-ports.com/tablette?t=JETON).
--
-- Principes :
--  * le jeton (32 octets aléatoires, base64 « URL-safe ») n'est JAMAIS stocké : seule son empreinte SHA-256 l'est ;
--  * l'ouverture du lien crée une session (autre jeton aléatoire, stocké lui aussi sous forme d'empreinte), valable
--    30 jours et prolongée à chaque visite ; la tablette garde cette session, plus le jeton du lien ;
--  * révoquer un lien coupe immédiatement ses sessions (elles sont revérifiées à chaque ouverture et toutes les 5 minutes) ;
--  * personne n'a accès direct aux tables (RLS sans politique) : tout passe par les fonctions ci-dessous ;
--  * une personne = (personne_type, personne_id), comme dans le suivi Terrain (inscription / participant_groupe / intervenant / equipe).

create table if not exists public.tablet_tokens (
  id            uuid primary key default gen_random_uuid(),
  personne_type text not null,
  personne_id   text not null,
  dossier       text,
  label         text,
  token_hash    text not null unique,
  created_at    timestamptz not null default now(),
  created_by    uuid default auth.uid(),
  expires_at    timestamptz,
  revoked_at    timestamptz,
  last_used_at  timestamptz,
  usage_count   integer not null default 0
);
create index if not exists tablet_tokens_personne_idx on public.tablet_tokens (personne_type, personne_id);

create table if not exists public.tablet_sessions (
  id           uuid primary key default gen_random_uuid(),
  token_id     uuid not null references public.tablet_tokens(id) on delete cascade,
  session_hash text not null unique,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at   timestamptz not null
);
create index if not exists tablet_sessions_token_idx on public.tablet_sessions (token_id);

alter table public.tablet_tokens enable row level security;
alter table public.tablet_sessions enable row level security;
revoke all on table public.tablet_tokens from anon, authenticated;
revoke all on table public.tablet_sessions from anon, authenticated;

-- Identité d'une personne (même source que terrain_liste)
create or replace function public._tablette_personne(p_type text, p_id text)
returns table(prenom text, nom text, organisation text, fonction text, pays text, categorie text, dossier text)
language sql
stable
security definer
set search_path to 'public'
as $$
  select c.prenom, c.nom, c.organisation, c.poste, c.pays, 'participant'::text, i.dossier
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where p_type = 'inscription' and i.dossier = p_id
  union all
  select ip.prenom, ip.nom, c.organisation, ip.poste, c.pays, 'participant'::text, ip.dossier
  from public.inscription_participants ip
  join public.inscriptions i on i.id = ip.inscription_id
  join public.contacts c on c.id = i.contact_id
  where p_type = 'participant_groupe' and ip.dossier = p_id
  union all
  select iv.prenom, iv.nom, iv.organisation, iv.fonction, iv.pays,
         (case when iv.equipe then 'organisation' else 'intervenant' end)::text, iv.dossier
  from public.intervenants iv
  where p_type in ('equipe', 'intervenant') and iv.dossier = p_id
  limit 1;
$$;
revoke all on function public._tablette_personne(text, text) from public, anon, authenticated;

-- ─── Côté tablette ──────────────────────────────────────────────────────────────

-- Ouverture du lien : vérifie l'empreinte du jeton, crée la session et la renvoie (une seule fois, en clair).
create or replace function public.tablette_connecter(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_token   text := btrim(coalesce(p_token, ''));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip      text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_row     public.tablet_tokens;
  v_session text;
  v_p       record;
begin
  -- limitation de débit : 30 échecs par heure et par adresse IP (le jeton n'est jamais journalisé)
  if (select count(*) from public.badge_login_attempts where cle = 'tb:lien' and ip = v_ip and not success and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  if v_token ~ '^[A-Za-z0-9_-]{32,128}$' then
    select * into v_row from public.tablet_tokens
    where token_hash = encode(digest(v_token, 'sha256'), 'hex')
      and revoked_at is null and (expires_at is null or expires_at > now());
  end if;

  insert into public.badge_login_attempts (cle, ip, success) values ('tb:lien', v_ip, v_row.id is not null);
  if v_row.id is null then
    return null;
  end if;

  select * into v_p from public._tablette_personne(v_row.personne_type, v_row.personne_id);

  delete from public.tablet_sessions where expires_at < now();
  v_session := translate(encode(gen_random_bytes(32), 'base64'), E'+/=\n', '-_');
  insert into public.tablet_sessions (token_id, session_hash, expires_at)
  values (v_row.id, encode(digest(v_session, 'sha256'), 'hex'), now() + interval '30 days');
  update public.tablet_tokens set last_used_at = now(), usage_count = usage_count + 1 where id = v_row.id;

  return jsonb_build_object(
    'session', v_session,
    'prenom', v_p.prenom, 'nom', v_p.nom, 'organisation', v_p.organisation, 'fonction', v_p.fonction,
    'pays', v_p.pays, 'categorie', v_p.categorie, 'dossier', v_p.dossier, 'label', v_row.label
  );
end;
$$;

-- Vérification de la session gardée par la tablette (prolongée de 30 jours, au plus une fois par heure)
create or replace function public.tablette_session(p_session text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_s public.tablet_sessions;
  v_t public.tablet_tokens;
  v_p record;
begin
  if coalesce(p_session, '') !~ '^[A-Za-z0-9_-]{32,128}$' then
    return null;
  end if;

  select * into v_s from public.tablet_sessions
  where session_hash = encode(digest(p_session, 'sha256'), 'hex') and expires_at > now();
  if v_s.id is null then
    return null;
  end if;

  select * into v_t from public.tablet_tokens
  where id = v_s.token_id and revoked_at is null and (expires_at is null or expires_at > now());
  if v_t.id is null then
    delete from public.tablet_sessions where id = v_s.id;
    return null;
  end if;

  if v_s.last_seen_at < now() - interval '1 hour' then
    update public.tablet_sessions set last_seen_at = now(), expires_at = now() + interval '30 days' where id = v_s.id;
    update public.tablet_tokens set last_used_at = now() where id = v_t.id;
  end if;

  select * into v_p from public._tablette_personne(v_t.personne_type, v_t.personne_id);
  return jsonb_build_object(
    'prenom', v_p.prenom, 'nom', v_p.nom, 'organisation', v_p.organisation, 'fonction', v_p.fonction,
    'pays', v_p.pays, 'categorie', v_p.categorie, 'dossier', v_p.dossier, 'label', v_t.label
  );
end;
$$;

grant execute on function public.tablette_connecter(text) to anon, authenticated;
grant execute on function public.tablette_session(text) to anon, authenticated;

-- ─── Côté administration (admin « all » uniquement) ─────────────────────────────

create or replace function public.admin_tablette_liste()
returns table(
  personne_type text, personne_id text, dossier text, prenom text, nom text, organisation text, pays text,
  categorie text, statut_dossier text,
  token_id uuid, token_cree_le timestamptz, token_expire_le timestamptz, token_revoque_le timestamptz,
  derniere_utilisation timestamptz, utilisations integer, sessions_actives integer
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
begin
  if not coalesce(public.is_admin('all'), false) then
    raise exception 'Acces reserve';
  end if;

  return query
  with personnes as (
    select 'inscription'::text as personne_type, i.dossier as personne_id, i.dossier, c.prenom, c.nom, c.organisation, c.pays,
           'participant'::text as categorie,
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end) as statut_dossier
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select 'participant_groupe', ip.dossier, ip.dossier, ip.prenom, ip.nom, c.organisation, c.pays, 'participant',
           (case i.paiement_status when 'confirme' then 'confirme' when 'reserve' then 'a_regulariser' else null end)
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where i.paiement_status not in ('annule', 'prospect')
    union all
    select (case when iv.equipe then 'equipe' else 'intervenant' end), iv.dossier, iv.dossier, iv.prenom, iv.nom, iv.organisation, iv.pays,
           (case when iv.equipe then 'organisation' else 'intervenant' end), null
    from public.intervenants iv
  )
  select p.personne_type, p.personne_id, p.dossier, p.prenom, p.nom, p.organisation, p.pays, p.categorie, p.statut_dossier,
         t.id, t.created_at, t.expires_at, t.revoked_at, t.last_used_at, coalesce(t.usage_count, 0),
         coalesce((select count(*)::int from public.tablet_sessions s where s.token_id = t.id and s.expires_at > now()), 0)
  from personnes p
  left join lateral (
    select * from public.tablet_tokens tt
    where tt.personne_type = p.personne_type and tt.personne_id = p.personne_id
    order by tt.created_at desc limit 1
  ) t on true
  order by p.nom, p.prenom;
end;
$$;

-- Génère les liens (un jeton aléatoire par personne) et les renvoie EN CLAIR une seule fois.
-- p_personnes : [{"type": "...", "id": "..."}]. Une personne qui a déjà un lien actif est ignorée,
-- sauf si p_regenerer est vrai (l'ancien lien est alors révoqué).
create or replace function public.admin_tablette_generer(p_personnes jsonb, p_expire timestamptz default null, p_regenerer boolean default false)
returns table(personne_type text, personne_id text, dossier text, label text, token_id uuid, token text)
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
#variable_conflict use_column
declare
  r record;
  v_p record;
  v_token text;
  v_id uuid;
  v_label text;
begin
  if not coalesce(public.is_admin('all'), false) then
    raise exception 'Acces reserve';
  end if;
  if p_personnes is null or jsonb_typeof(p_personnes) <> 'array' then
    raise exception 'Liste de personnes invalide';
  end if;
  if jsonb_array_length(p_personnes) > 500 then
    raise exception 'Trop de personnes en une fois (500 maximum)';
  end if;

  for r in select (e->>'type') as t, (e->>'id') as i from jsonb_array_elements(p_personnes) e loop
    select * into v_p from public._tablette_personne(r.t, r.i);
    if v_p.nom is null and v_p.prenom is null then
      continue;
    end if;

    if exists (select 1 from public.tablet_tokens x where x.personne_type = r.t and x.personne_id = r.i
               and x.revoked_at is null and (x.expires_at is null or x.expires_at > now())) then
      if not p_regenerer then
        continue;
      end if;
      update public.tablet_tokens x set revoked_at = now() where x.personne_type = r.t and x.personne_id = r.i and x.revoked_at is null;
      delete from public.tablet_sessions s using public.tablet_tokens x where s.token_id = x.id and x.personne_type = r.t and x.personne_id = r.i;
    end if;

    v_token := translate(encode(gen_random_bytes(32), 'base64'), E'+/=\n', '-_');
    v_label := btrim(coalesce(v_p.prenom, '') || ' ' || coalesce(v_p.nom, ''));
    insert into public.tablet_tokens (personne_type, personne_id, dossier, label, token_hash, expires_at)
    values (r.t, r.i, v_p.dossier, v_label, encode(digest(v_token, 'sha256'), 'hex'), p_expire)
    returning id into v_id;

    return query select r.t, r.i, v_p.dossier, v_label, v_id, v_token;
  end loop;
end;
$$;

-- Révocation immédiate (tablette perdue) : le lien ne fonctionne plus et ses sessions sont coupées.
create or replace function public.admin_tablette_revoquer(p_token_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_n integer;
begin
  if not coalesce(public.is_admin('all'), false) then
    raise exception 'Acces reserve';
  end if;
  update public.tablet_tokens set revoked_at = now() where id = p_token_id and revoked_at is null;
  get diagnostics v_n = row_count;
  delete from public.tablet_sessions where token_id = p_token_id;
  return v_n > 0;
end;
$$;

revoke execute on function public.admin_tablette_liste() from public, anon;
revoke execute on function public.admin_tablette_generer(jsonb, timestamptz, boolean) from public, anon;
revoke execute on function public.admin_tablette_revoquer(uuid) from public, anon;
grant execute on function public.admin_tablette_liste() to authenticated;
grant execute on function public.admin_tablette_generer(jsonb, timestamptz, boolean) to authenticated;
grant execute on function public.admin_tablette_revoquer(uuid) to authenticated;
