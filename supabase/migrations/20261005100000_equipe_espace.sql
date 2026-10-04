-- Espace équipe (/espace-equipe) : contenu éditable depuis l'admin (onglet « Équipe »).
-- Les 5 membres n'ont pas de compte Supabase Auth : la lecture passe par la fonction
-- equipe_login(dossier, email) (SECURITY DEFINER, anti-bruteforce) qui ne renvoie QUE les données du
-- membre identifié. Les tables n'ont aucune policy pour anon/authenticated hors admin.

create table if not exists public.equipe_membres (
  id               uuid primary key default gen_random_uuid(),
  dossier          text unique,               -- lien avec intervenants.dossier (photo, QR du badge)
  nom              text not null,
  email            text,
  email2           text,                      -- 2e adresse acceptée à la connexion
  photo_url        text,
  role             text,
  equipe           text,
  comite           text,
  responsable_nom  text,
  responsable_tel  text,
  tenue            text,
  consignes        text[] not null default '{}',
  rdv_lieu         text,
  rdv_detail       text,
  badge_url        text,                      -- facultatif : remplace le badge public /badge/<token>
  attestation_url  text,                      -- bouton « Télécharger mon attestation » (actif à partir du 21 oct.)
  ordre            integer not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.equipe_planning (
  id         uuid primary key default gen_random_uuid(),
  membre_id  uuid not null references public.equipe_membres(id) on delete cascade,
  jour       date not null,
  horaire    text,
  tache      text not null,
  lieu       text,
  ordre      integer not null default 0
);
create index if not exists equipe_planning_membre on public.equipe_planning (membre_id, jour, ordre);

create table if not exists public.equipe_documents (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  type         text not null check (type in ('charte', 'programme', 'plan')),
  url          text,
  visible_pour uuid[],                        -- null = tous les membres ; sinon liste d'identifiants de membres
  ordre        integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.equipe_membres   enable row level security;
alter table public.equipe_planning  enable row level security;
alter table public.equipe_documents enable row level security;

drop policy if exists admin_all_equipe_membres on public.equipe_membres;
create policy admin_all_equipe_membres on public.equipe_membres for all to authenticated
  using (public.is_admin('all')) with check (public.is_admin('all'));
drop policy if exists admin_all_equipe_planning on public.equipe_planning;
create policy admin_all_equipe_planning on public.equipe_planning for all to authenticated
  using (public.is_admin('all')) with check (public.is_admin('all'));
drop policy if exists admin_all_equipe_documents on public.equipe_documents;
create policy admin_all_equipe_documents on public.equipe_documents for all to authenticated
  using (public.is_admin('all')) with check (public.is_admin('all'));

-- Connexion + lecture des données du membre (dossier + email, même principe que /intervenant).
create or replace function public.equipe_login(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_dossier text := regexp_replace(lower(coalesce(p_dossier, '')), '[^a-z0-9]', '', 'g');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_m public.equipe_membres;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text;
  v_iv public.intervenants;
begin
  if v_dossier = '' or v_email = '' then
    return null;
  end if;

  v_cle := 'eq:' || v_dossier;
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'eq:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select m.* into v_m
  from public.equipe_membres m
  where regexp_replace(lower(coalesce(m.dossier, '')), '[^a-z0-9]', '', 'g') = v_dossier
    and ((m.email is not null and lower(btrim(m.email)) = v_email)
         or (m.email2 is not null and lower(btrim(m.email2)) = v_email))
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_m.id is not null);

  if v_m.id is null then
    return null;
  end if;

  select i.* into v_iv from public.intervenants i where i.dossier = v_m.dossier limit 1;

  return jsonb_build_object(
    'membre', to_jsonb(v_m) - 'email' - 'email2',
    'photo_url', coalesce(nullif(v_m.photo_url, ''), v_iv.photo_url),
    'badge_token', v_iv.badge_token,
    'planning', coalesce((
      select jsonb_agg(to_jsonb(p) - 'membre_id' order by p.jour, p.ordre, p.horaire)
      from public.equipe_planning p where p.membre_id = v_m.id
    ), '[]'::jsonb),
    'documents', coalesce((
      select jsonb_agg(to_jsonb(d) - 'visible_pour' order by d.ordre, d.created_at)
      from public.equipe_documents d where d.visible_pour is null or v_m.id = any(d.visible_pour)
    ), '[]'::jsonb)
  );
end;
$function$;
revoke execute on function public.equipe_login(text, text) from public;
grant execute on function public.equipe_login(text, text) to anon, authenticated;
