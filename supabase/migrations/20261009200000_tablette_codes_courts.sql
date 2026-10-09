-- Liens courts des tablettes : https://copaf-ports.com/t/CODE
--
-- CODE = 10 caractères aléatoires (random sécurisé pgcrypto, tirage sans biais) pris dans un alphabet sans caractères ambigus
-- (sans 0 O 1 I L : 31 symboles, soit ~49 bits d'entropie), insensible à la casse (comparé en majuscules).
-- La table tablet_tokens ne change pas : on y stocke toujours uniquement l'empreinte SHA-256 du code.
-- Un code court étant plus facile à deviner qu'un jeton de 32 octets, la limitation de débit est stricte :
--   * par adresse IP : 8 échecs en 15 minutes ou 20 en 1 heure → blocage temporaire ;
--   * toutes adresses confondues : 200 échecs par heure → blocage temporaire de la route (contre une attaque répartie).
-- Les anciens jetons longs (/tablette?t=…) restent acceptés.

create or replace function public._tablette_code()
returns text
language plpgsql
volatile
set search_path to 'public', 'extensions'
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';  -- 31 caractères
  v_out text := '';
  v_b bytea;
  i integer;
begin
  while length(v_out) < 10 loop
    v_b := gen_random_bytes(16);
    for i in 0..15 loop
      -- rejet des octets >= 248 (= 31 × 8) pour que chaque caractère ait exactement la même probabilité
      if length(v_out) < 10 and get_byte(v_b, i) < 248 then
        v_out := v_out || substr(v_alphabet, (get_byte(v_b, i) % 31) + 1, 1);
      end if;
    end loop;
  end loop;
  return v_out;
end;
$$;
revoke all on function public._tablette_code() from public, anon, authenticated;

create or replace function public.tablette_connecter(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_brut    text := btrim(coalesce(p_token, ''));
  v_token   text;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip      text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_row     public.tablet_tokens;
  v_session text;
  v_p       record;
begin
  -- limitation de débit stricte (le code n'est jamais journalisé)
  if (select count(*) from public.badge_login_attempts where cle = 'tb:lien' and ip = v_ip and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where cle = 'tb:lien' and ip = v_ip and not success and created_at > now() - interval '1 hour') >= 20
     or (select count(*) from public.badge_login_attempts where cle = 'tb:lien' and not success and created_at > now() - interval '1 hour') >= 200 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  -- code court : insensible à la casse (majuscules) ; ancien jeton long : tel quel
  v_token := case when length(v_brut) <= 12 then upper(v_brut) else v_brut end;

  if v_token ~ '^[A-Za-z0-9_-]{8,128}$' then
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

-- Génération : un code court par personne (même logique qu'avant, mais le « token » renvoyé est le code court)
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
  v_essai integer;
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

    -- code unique (collision quasi impossible, mais on vérifie)
    v_essai := 0;
    loop
      v_token := public._tablette_code();
      exit when not exists (select 1 from public.tablet_tokens x where x.token_hash = encode(digest(v_token, 'sha256'), 'hex'));
      v_essai := v_essai + 1;
      if v_essai > 20 then raise exception 'Generation de code impossible'; end if;
    end loop;

    v_label := btrim(coalesce(v_p.prenom, '') || ' ' || coalesce(v_p.nom, ''));
    insert into public.tablet_tokens (personne_type, personne_id, dossier, label, token_hash, expires_at)
    values (r.t, r.i, v_p.dossier, v_label, encode(digest(v_token, 'sha256'), 'hex'), p_expire)
    returning id into v_id;

    return query select r.t, r.i, v_p.dossier, v_label, v_id, v_token;
  end loop;
end;
$$;
