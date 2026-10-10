-- Attestations de participation COPAF 2026 : liste administrable + vérification publique par numéro (COPAF-2026-EXEC-XXXX).
--
-- Une ligne par personne, avec les champs tels qu'ils doivent être imprimés (modifiables : orthographe du nom, fonction, langue…).
-- La liste peut être importée (Excel/CSV) ou alimentée depuis les inscrits ; personne_type / personne_id gardent le lien avec l'inscrit.
-- Écriture réservée à l'admin (RLS) ; le public n'a accès qu'à la fonction verifier_attestation, qui ne renvoie ni e-mail ni téléphone.

create table if not exists public.attestations (
  id                 uuid primary key default gen_random_uuid(),
  code               text unique,
  civilite           text check (civilite in ('M.', 'Mme')),
  prenom             text not null,
  nom                text not null,
  fonction           text,
  autorite_portuaire text,
  pays               text,
  pays_iso2          text check (pays_iso2 ~ '^[A-Z]{2}$'),
  langue             text not null default 'FR' check (langue in ('FR', 'EN')),
  logo_url           text,
  publie             boolean not null default false,
  personne_type      text,
  personne_id        text,
  created_at         timestamptz not null default now()
);
create index if not exists attestations_nom_idx on public.attestations (lower(nom), lower(prenom));

alter table public.attestations enable row level security;
revoke all on table public.attestations from anon;
drop policy if exists attestations_admin_all on public.attestations;
create policy attestations_admin_all on public.attestations for all to authenticated
  using (public.is_admin('all')) with check (public.is_admin('all'));

-- Suffixe aléatoire de 4 caractères, alphabet de 32 symboles sans O, 0, I, 1 (256 est multiple de 32 : aucun biais de tirage)
create or replace function public._attestation_suffixe()
returns text
language plpgsql
volatile
set search_path to 'public', 'extensions'
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_b bytea := gen_random_bytes(4);
  v_out text := '';
  i integer;
begin
  for i in 0..3 loop
    v_out := v_out || substr(v_alphabet, (get_byte(v_b, i) % 32) + 1, 1);
  end loop;
  return v_out;
end;
$$;
revoke all on function public._attestation_suffixe() from public, anon, authenticated;

-- « Générer les codes manquants » : un code unique COPAF-2026-EXEC-XXXX pour chaque ligne sans code ; renvoie le nombre de codes créés
create or replace function public.admin_attestation_generer_codes()
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  r record;
  v_code text;
  v_n integer := 0;
  v_essai integer;
begin
  if not coalesce(public.is_admin('all'), false) then
    raise exception 'Acces reserve';
  end if;

  for r in select id from public.attestations where code is null order by created_at, nom, prenom loop
    v_essai := 0;
    loop
      v_code := 'COPAF-2026-EXEC-' || public._attestation_suffixe();
      exit when not exists (select 1 from public.attestations a where a.code = v_code);
      v_essai := v_essai + 1;
      if v_essai > 50 then raise exception 'Generation de code impossible'; end if;
    end loop;
    update public.attestations set code = v_code where id = r.id;
    v_n := v_n + 1;
  end loop;

  return v_n;
end;
$$;
revoke execute on function public.admin_attestation_generer_codes() from public, anon;
grant execute on function public.admin_attestation_generer_codes() to authenticated;

-- Vérification publique. Renvoie toujours un objet :
--   {statut:'introuvable'} | {statut:'en_preparation', langue} | {statut:'ok', ...champs de l'attestation}
-- Limitation de débit : 10 requêtes par minute et par adresse IP (300 par minute au total, contre une énumération répartie).
-- Avant le 21/10/2026 (heure de Casablanca), seules les attestations marquées « publie » sont affichées.
create or replace function public.verifier_attestation(p_code text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_brut    text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_code    text;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip      text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_row     public.attestations;
begin
  if (select count(*) from public.badge_login_attempts where cle = 'att:verif' and ip = v_ip and created_at > now() - interval '1 minute') >= 10
     or (select count(*) from public.badge_login_attempts where cle = 'att:verif' and created_at > now() - interval '1 minute') >= 300 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  if v_brut ~ '^COPAF2026EXEC[A-Z0-9]{4}$' then
    v_code := 'COPAF-2026-EXEC-' || right(v_brut, 4);
    select * into v_row from public.attestations where code = v_code;
  end if;

  insert into public.badge_login_attempts (cle, ip, success) values ('att:verif', v_ip, v_row.id is not null);

  if v_row.id is null then
    return jsonb_build_object('statut', 'introuvable');
  end if;

  if not (v_row.publie or (now() at time zone 'Africa/Casablanca')::date >= date '2026-10-21') then
    return jsonb_build_object('statut', 'en_preparation', 'langue', v_row.langue);
  end if;

  return jsonb_build_object(
    'statut', 'ok', 'code', v_row.code, 'civilite', v_row.civilite, 'prenom', v_row.prenom, 'nom', v_row.nom,
    'fonction', v_row.fonction, 'autorite_portuaire', v_row.autorite_portuaire, 'pays', v_row.pays, 'pays_iso2', v_row.pays_iso2,
    'langue', v_row.langue, 'logo_url', v_row.logo_url
  );
end;
$$;
grant execute on function public.verifier_attestation(text) to anon, authenticated;
