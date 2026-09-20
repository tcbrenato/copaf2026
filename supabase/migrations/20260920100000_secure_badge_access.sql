-- Securisation de l'acces "Mon espace" par dossier (/badge) et fin des scans de passeport.
--
-- Avant : un numero de dossier (5 chiffres, devinable) suffisait pour lire
-- nom/email/telephone/photo ET recuperer le jeton du badge, qui permettait de
-- modifier email/telephone/photo/passeport. Apres : dossier + secret personnel
-- (code d'acces, ou email), verrouillage apres essais rates, et plus aucun
-- jeton renvoye. Le passeport n'est plus collecte sous forme de scan : numero
-- + nom/prenom tels qu'ecrits sur le passeport.

-- 1) Colonnes
alter table public.inscription_participants
  add column if not exists code_acces text,
  add column if not exists nom_passeport text,
  add column if not exists prenom_passeport text;
alter table public.inscriptions
  add column if not exists nom_passeport text,
  add column if not exists prenom_passeport text;
alter table public.intervenants
  add column if not exists numero_passeport text,
  add column if not exists nom_passeport text,
  add column if not exists prenom_passeport text;

-- 2) Generateur de code d'acces (8 caracteres, sans 0/O/1/I/L pour eviter les confusions)
create or replace function public.generer_code_acces()
returns text
language plpgsql
volatile
set search_path to 'public'
as $function$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  b bytea := extensions.gen_random_bytes(8);
  r text := '';
  i int;
begin
  for i in 0..7 loop
    r := r || substr(alphabet, (get_byte(b, i) % length(alphabet)) + 1, 1);
  end loop;
  return r;
end;
$function$;
revoke execute on function public.generer_code_acces() from public, anon, authenticated;

create or replace function public.trg_code_acces()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.code_acces is null or btrim(new.code_acces) = '' then
    new.code_acces := public.generer_code_acces();
  end if;
  return new;
end;
$function$;
revoke execute on function public.trg_code_acces() from public, anon, authenticated;

drop trigger if exists trg_inscription_participants_code_acces on public.inscription_participants;
create trigger trg_inscription_participants_code_acces
  before insert on public.inscription_participants
  for each row execute function public.trg_code_acces();

update public.inscription_participants set code_acces = public.generer_code_acces() where code_acces is null;

-- 3) Journal des tentatives (verrouillage)
create table if not exists public.badge_login_attempts (
  id bigserial primary key,
  cle text not null,
  ip text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists badge_login_attempts_cle_idx on public.badge_login_attempts (cle, created_at desc);
create index if not exists badge_login_attempts_ip_idx on public.badge_login_attempts (ip, created_at desc);
alter table public.badge_login_attempts enable row level security;

-- 4) Verification dossier + secret (interne, jamais appelable depuis le navigateur)
create or replace function public._badge_authentifier(p_dossier text, p_secret text)
returns table(cible text, cible_id uuid)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_secret text := btrim(coalesce(p_secret, ''));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_id uuid;
  v_cible text;
begin
  if v_dossier = '' or v_secret = '' then return; end if;

  if (select count(*) from public.badge_login_attempts where cle = v_dossier and not success and created_at > now() - interval '15 minutes') >= 5
     or (select count(*) from public.badge_login_attempts where ip = v_ip and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard / Too many attempts, try again later';
  end if;

  -- Contact principal d'une inscription : secret = son email
  select i.id into v_id
  from public.inscriptions i join public.contacts c on c.id = i.contact_id
  where lower(i.dossier) = v_dossier and c.email is not null and lower(c.email) = lower(v_secret)
  limit 1;
  if v_id is not null then v_cible := 'inscriptions'; end if;

  -- Membre de delegation : secret = code d'acces, ou email s'il l'a renseigne
  if v_id is null then
    select ip.id into v_id
    from public.inscription_participants ip
    where lower(ip.dossier) = v_dossier
      and ((ip.code_acces is not null and upper(ip.code_acces) = upper(v_secret))
           or (ip.email is not null and lower(ip.email) = lower(v_secret)))
    limit 1;
    if v_id is not null then v_cible := 'inscription_participants'; end if;
  end if;

  -- Intervenant : secret = son email (le code d'acces de l'espace intervenant
  -- est commun a plusieurs personnes, il ne doit pas servir ici)
  if v_id is null then
    select iv.id into v_id
    from public.intervenants iv
    where lower(iv.dossier) = v_dossier and iv.email is not null and lower(iv.email) = lower(v_secret)
    limit 1;
    if v_id is not null then v_cible := 'intervenants'; end if;
  end if;

  insert into public.badge_login_attempts (cle, ip, success) values (v_dossier, v_ip, v_id is not null);

  if v_id is null then return; end if;
  cible := v_cible;
  cible_id := v_id;
  return next;
end;
$function$;
revoke execute on function public._badge_authentifier(text, text) from public, anon, authenticated;

-- 5) Connexion : renvoie uniquement les donnees de la personne, apres verification
create or replace function public.badge_login(p_dossier text, p_secret text)
returns table(
  dossier text, nom text, prenom text, poste text, organisation text, categorie text,
  photo_url text, email text, telephone text, langue text,
  nom_passeport text, prenom_passeport text, passeport_renseigne boolean
)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cible text;
  v_id uuid;
begin
  select a.cible, a.cible_id into v_cible, v_id from public._badge_authentifier(p_dossier, p_secret) a;
  if v_id is null then return; end if;

  perform public.log_connexion(btrim(p_dossier), 'badge');

  if v_cible = 'inscriptions' then
    return query
    select i.dossier, c.nom, c.prenom, c.poste, c.organisation, i.badge_categorie,
           i.photo_url, c.email, c.telephone, coalesce(i.langue, 'fr'),
           i.nom_passeport, i.prenom_passeport, (coalesce(i.numero_passeport, '') <> '')
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where i.id = v_id;
  elsif v_cible = 'inscription_participants' then
    return query
    select ip.dossier, ip.nom, ip.prenom, ip.poste, c.organisation, ip.badge_categorie,
           ip.photo_url, ip.email, ip.telephone, coalesce(ip.langue, i.langue, 'fr'),
           ip.nom_passeport, ip.prenom_passeport, (coalesce(ip.numero_passeport, '') <> '')
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where ip.id = v_id;
  else
    return query
    select iv.dossier, iv.nom, iv.prenom, iv.fonction, iv.organisation, 'Intervenant'::text,
           iv.photo_url, iv.email, iv.telephone, coalesce(iv.langue, 'fr'),
           iv.nom_passeport, iv.prenom_passeport, (coalesce(iv.numero_passeport, '') <> '')
    from public.intervenants iv
    where iv.id = v_id;
  end if;
end;
$function$;

-- 6) Mise a jour d'un champ par la personne elle-meme (dossier + secret a chaque appel)
create or replace function public.badge_update(p_dossier text, p_secret text, p_field text, p_value text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_cible text;
  v_id uuid;
  v_val text := btrim(coalesce(p_value, ''));
  v_contact uuid;
  v_table text;
  v_n int := 0;
begin
  if p_field not in ('photo_url', 'email', 'telephone', 'numero_passeport', 'nom_passeport', 'prenom_passeport') then
    raise exception 'Champ non autorise';
  end if;

  select a.cible, a.cible_id into v_cible, v_id from public._badge_authentifier(p_dossier, p_secret) a;
  if v_id is null then return false; end if;

  if p_field = 'email' and v_val !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Email invalide';
  end if;
  if p_field = 'photo_url' and v_val not like 'https://pdtohaxbsgpxccopgnmd.supabase.co/storage/v1/object/public/badges-photos/%' then
    raise exception 'Photo invalide';
  end if;
  if p_field = 'telephone' and v_val !~ '^[0-9+()\s.-]{5,30}$' then
    raise exception 'Telephone invalide';
  end if;
  if p_field = 'numero_passeport' then
    v_val := upper(v_val);
    if v_val !~ '^[A-Z0-9]{5,20}$' then raise exception 'Numero de passeport invalide'; end if;
  end if;
  if p_field in ('nom_passeport', 'prenom_passeport') and (length(v_val) < 1 or length(v_val) > 100 or v_val ~ '[<>0-9@;{}|\\\[\]]') then
    raise exception 'Nom invalide';
  end if;

  v_table := v_cible;

  -- Email / telephone d'un contact principal : portes par la table contacts
  if v_cible = 'inscriptions' and p_field in ('email', 'telephone') then
    select contact_id into v_contact from public.inscriptions where id = v_id;
    if v_contact is null then return false; end if;
    begin
      execute format('update public.contacts set %I = $1 where id = $2', p_field) using v_val, v_contact;
      get diagnostics v_n = row_count;
    exception when unique_violation then
      return false;
    end;
    return v_n > 0;
  end if;

  begin
    execute format('update public.%I set %I = $1 where id = $2', v_table, p_field) using v_val, v_id;
    get diagnostics v_n = row_count;
  exception when unique_violation then
    return false;
  end;
  return v_n > 0;
end;
$function$;
