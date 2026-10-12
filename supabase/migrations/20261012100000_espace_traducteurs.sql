-- Espace Traducteurs (/espace-traducteur) : infos clés en fenêtres (cartes), programme, planning, intervenants, glossaire
-- et documents téléchargeables, tout en français et en anglais, modifiable depuis l'admin (onglet « Traducteurs »).
--
-- Accès : un traducteur est un compte « intervenant » (onglet admin Intervenants) avec la case « Traducteur » cochée.
-- Il se connecte comme dans l'espace équipe (dossier + e-mail). La fonction traducteur_login ne renvoie que le contenu de
-- l'espace et les NOMS des autres traducteurs : jamais l'e-mail, le téléphone, le passeport ni les données des autres intervenants.
-- Les tables sont fermées au public (RLS) : lecture/écriture réservées à l'admin.

alter table public.intervenants add column if not exists traducteur boolean not null default false;

-- ─── Tables ─────────────────────────────────────────────────────────────────────
create table if not exists public.traducteur_cartes (
  id         text primary key,
  ordre      integer not null default 0,
  titre_fr   text not null,
  titre_en   text not null,
  contenu_fr text not null default '',
  contenu_en text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.traducteur_programme (
  id       uuid primary key default gen_random_uuid(),
  jour     integer not null check (jour between 1 and 3),
  debut    text,
  fin      text,
  titre_fr text not null default '',
  titre_en text not null default '',
  salle    text,
  notes_fr text,
  notes_en text,
  ordre    integer not null default 0
);

create table if not exists public.traducteur_planning (
  id                  uuid primary key default gen_random_uuid(),
  jour                integer not null check (jour between 1 and 3),
  horaire             text,
  session_fr          text not null default '',
  session_en          text not null default '',
  traducteur_dossier  text,
  relais              text,
  notes_fr            text,
  notes_en            text,
  ordre               integer not null default 0
);

create table if not exists public.traducteur_intervenants (
  id           uuid primary key default gen_random_uuid(),
  nom          text not null,
  fonction_fr  text,
  fonction_en  text,
  pays         text,
  langue       text not null default 'FR' check (langue in ('FR', 'EN', 'FR/EN')),
  session_fr   text,
  session_en   text,
  prononciation text,
  ordre        integer not null default 0
);

create table if not exists public.traducteur_glossaire (
  id            uuid primary key default gen_random_uuid(),
  categorie     text not null default 'portuaire' check (categorie in ('portuaire', 'ia', 'cyber', 'sigle')),
  terme_fr      text not null default '',
  terme_en      text not null default '',
  definition_fr text,
  definition_en text,
  ordre         integer not null default 0
);

create table if not exists public.traducteur_documents (
  id            uuid primary key default gen_random_uuid(),
  categorie     text not null check (categorie in ('programme', 'carnet', 'intervenants', 'presentations', 'glossaire', 'plan', 'note', 'magazine')),
  titre_fr      text not null,
  titre_en      text not null,
  langue        text not null default 'FR' check (langue in ('FR', 'EN', 'FR/EN')),
  url           text,
  statut        text not null default 'attente' check (statut in ('disponible', 'attente')),
  ajoute_le     timestamptz not null default now(),
  disponible_le timestamptz,
  ordre         integer not null default 0
);

-- Date de passage « En attente » → « Disponible » (sert à signaler les nouveaux documents dans l'espace)
create or replace function public._traducteur_document_dates()
returns trigger
language plpgsql
as $$
begin
  if new.statut = 'disponible' then
    if tg_op = 'INSERT' or old.statut is distinct from 'disponible' then new.disponible_le := now(); end if;
  else
    new.disponible_le := null;
  end if;
  return new;
end;
$$;
drop trigger if exists traducteur_documents_dates on public.traducteur_documents;
create trigger traducteur_documents_dates before insert or update on public.traducteur_documents
  for each row execute function public._traducteur_document_dates();

-- ─── Droits : admin uniquement ──────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['traducteur_cartes', 'traducteur_programme', 'traducteur_planning', 'traducteur_intervenants', 'traducteur_glossaire', 'traducteur_documents'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin(''all'')) with check (public.is_admin(''all''))', t || '_admin_all', t);
  end loop;
end $$;

-- ─── Contenu initial : uniquement les faits connus, le reste est marqué « À compléter » ─────────────────
insert into public.traducteur_cartes (id, ordre, titre_fr, titre_en, contenu_fr, contenu_en) values
('conference', 1, 'La conférence en bref', 'The conference at a glance',
$fr$## COPAF 2026 – Conférence des Ports Africains
- Thème : Smart Port Africain : IA et Cybersécurité au service de la performance
- Dates : du 19 au 21 octobre 2026
- Lieu : Port Community Building, Casablanca (Maroc)
- Organisateurs : AGPAOC, UAPNA, ANP, CRF PERFECTION$fr$,
$en$## COPAF 2026 – Conference of African Ports
- Theme: African Smart Port: AI and Cybersecurity for Enhanced Performance
- Dates: 19 to 21 October 2026
- Venue: Port Community Building, Casablanca (Morocco)
- Organisers: AGPAOC, UAPNA, ANP, CRF PERFECTION$en$),
('programme', 2, 'Programme jour par jour', 'Day-by-day programme',
$fr$Le programme détaillé figure ci-dessous, jour par jour, avec les horaires.
## Attention au jour 3
Le jour 3 est une visite de terrain au Port de Casablanca : les conditions d'interprétation changent (déplacements, extérieur). Le détail sera communiqué par l'organisation.$fr$,
$en$The detailed programme is shown below, day by day, with times.
## Note for day 3
Day 3 is a field visit to the Port of Casablanca: interpreting conditions change (travel, outdoors). The organisation will share the details.$en$),
('planning', 3, 'Mon planning', 'My schedule',
$fr$Langues de travail : français ↔ anglais. Trois traducteurs se relaient. Le tableau ci-dessous indique qui couvre quelle session et les relais ; vos sessions sont mises en évidence.$fr$,
$en$Working languages: French ↔ English. Three interpreters take turns. The table below shows who covers which session and the handovers; your sessions are highlighted.$en$),
('intervenants', 4, 'Intervenants', 'Speakers',
$fr$Nom, fonction, pays, langue d'intervention et session de chaque intervenant. Une aide à la prononciation est indiquée sous le nom lorsqu'elle est renseignée.$fr$,
$en$Name, position, country, language of the talk and session of each speaker. A pronunciation aid is shown under the name when available.$en$),
('glossaire', 5, 'Glossaire essentiel', 'Essential glossary',
$fr$Termes portuaires et maritimes, intelligence artificielle, cybersécurité, et sigles. Utilisez la recherche pour retrouver un terme.$fr$,
$en$Port and maritime terms, artificial intelligence, cybersecurity and acronyms. Use the search to find a term.$en$),
('logistique', 6, 'Logistique et matériel', 'Logistics and equipment',
$fr$## Cabine d'interprétation
À compléter
## Heure d'arrivée
À compléter
## Test son
Un test son est à faire avant chaque journée. Horaire : À compléter
## Casques et canaux
À compléter
## Régie technique
À compléter
## Pauses et repas
À compléter$fr$,
$en$## Interpreting booth
To be completed
## Arrival time
To be completed
## Sound check
A sound check must be done before each day. Time: To be completed
## Headsets and channels
To be completed
## Technical control room
To be completed
## Breaks and meals
To be completed$en$),
('contacts', 7, 'Contacts et urgences', 'Contacts and emergencies',
$fr$Qui appeler selon le type de problème.
## Organisation
À compléter
## Technique
À compléter
## Direction générale (DG)
À compléter
## Logistique
À compléter$fr$,
$en$Who to call depending on the type of problem.
## Organisation
To be completed
## Technical
To be completed
## General Management (DG)
To be completed
## Logistics
To be completed$en$),
('regles', 8, 'Règles de la mission', 'Mission rules',
$fr$- Confidentialité : les documents, présentations et propos entendus pendant la mission restent confidentiels.
- Ponctualité : être en cabine à l'heure d'arrivée indiquée (À compléter).
- Tenue : tenue professionnelle (précisions : À compléter).
- Badge : le port du badge est obligatoire.$fr$,
$en$- Confidentiality: documents, presentations and anything heard during the mission remain confidential.
- Punctuality: be in the booth at the arrival time given (To be completed).
- Dress code: professional attire (details: To be completed).
- Badge: wearing the badge is mandatory.$en$)
on conflict (id) do nothing;

insert into public.traducteur_programme (jour, titre_fr, titre_en, ordre)
select j, case when j = 3 then 'Visite de terrain – Port de Casablanca' else 'À compléter' end,
       case when j = 3 then 'Field visit – Port of Casablanca' else 'To be completed' end, 1
from generate_series(1, 3) j
where not exists (select 1 from public.traducteur_programme);

insert into public.traducteur_glossaire (categorie, terme_fr, terme_en, definition_fr, definition_en, ordre)
select * from (values
  ('sigle', 'AGPAOC', 'PMAWCA', 'Association de Gestion des Ports de l''Afrique de l''Ouest et du Centre (PMAWCA en anglais).', 'Port Management Association of West and Central Africa (AGPAOC in French).', 1),
  ('sigle', 'UAPNA', 'UAPNA', 'À compléter', 'To be completed', 2),
  ('sigle', 'ANP', 'ANP', 'Agence Nationale des Ports (Maroc).', 'National Ports Agency (Morocco).', 3),
  ('sigle', 'CRF Perfection', 'CRF Perfection', 'Organisateur de la COPAF 2026.', 'Organiser of COPAF 2026.', 4),
  ('sigle', 'COPAF', 'COPAF', 'Conférence des Ports Africains.', 'Conference of African Ports.', 5)
) v(categorie, terme_fr, terme_en, definition_fr, definition_en, ordre)
where not exists (select 1 from public.traducteur_glossaire);

insert into public.traducteur_documents (categorie, titre_fr, titre_en, langue, url, statut, ordre)
select * from (values
  ('programme', 'Programme officiel (français)', 'Official programme (French)', 'FR', '/programmecopaf2026FRmaj.pdf', 'disponible', 1),
  ('programme', 'Programme officiel (anglais)', 'Official programme (English)', 'EN', '/programmecopaf2026ENGmaj.pdf', 'disponible', 2),
  ('carnet', 'Carnet de la conférence', 'Conference booklet', 'FR/EN', null, 'attente', 3),
  ('intervenants', 'Liste des intervenants', 'List of speakers', 'FR/EN', null, 'attente', 4),
  ('presentations', 'Présentations et discours des intervenants', 'Speakers'' presentations and speeches', 'FR/EN', null, 'attente', 5),
  ('glossaire', 'Glossaire (français)', 'Glossary (French)', 'FR', null, 'attente', 6),
  ('glossaire', 'Glossaire (anglais)', 'Glossary (English)', 'EN', null, 'attente', 7),
  ('plan', 'Plan du lieu et des salles', 'Venue and room plan', 'FR/EN', null, 'attente', 8),
  ('note', 'Note de cadrage des traducteurs (1 page)', 'Interpreters'' briefing note (1 page)', 'FR/EN', null, 'attente', 9),
  ('magazine', 'Magazine AMP/MPA (facultatif)', 'AMP/MPA magazine (optional)', 'FR/EN', null, 'attente', 10)
) v(categorie, titre_fr, titre_en, langue, url, statut, ordre)
where not exists (select 1 from public.traducteur_documents);

-- ─── Connexion de l'espace : renvoie le contenu et les noms des traducteurs, rien de privé ───────────
create or replace function public.traducteur_login(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_dossier text := regexp_replace(lower(coalesce(p_dossier, '')), '[^a-z0-9]', '', 'g');
  v_email   text := lower(btrim(coalesce(p_email, '')));
  v_iv      public.intervenants;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip      text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle     text;
begin
  if v_dossier = '' or v_email = '' then
    return null;
  end if;

  v_cle := 'ttr:' || v_dossier;
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'ttr:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select i.* into v_iv
  from public.intervenants i
  where i.traducteur
    and regexp_replace(lower(i.dossier), '[^a-z0-9]', '', 'g') = v_dossier
    and ((i.email is not null and lower(btrim(i.email)) = v_email)
         or (i.email_secondaire is not null and lower(btrim(i.email_secondaire)) = v_email))
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_iv.id is not null);

  if v_iv.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'traducteur', jsonb_build_object('dossier', v_iv.dossier, 'prenom', v_iv.prenom, 'nom', v_iv.nom, 'photo_url', v_iv.photo_url),
    'traducteurs', coalesce((select jsonb_agg(jsonb_build_object('dossier', t.dossier, 'prenom', t.prenom, 'nom', t.nom) order by t.ordre, t.nom)
                             from public.intervenants t where t.traducteur), '[]'::jsonb),
    'cartes', coalesce((select jsonb_agg(to_jsonb(c) - 'updated_at' order by c.ordre) from public.traducteur_cartes c), '[]'::jsonb),
    'programme', coalesce((select jsonb_agg(to_jsonb(p) order by p.jour, p.ordre, p.debut) from public.traducteur_programme p), '[]'::jsonb),
    'planning', coalesce((select jsonb_agg(to_jsonb(p) order by p.jour, p.ordre, p.horaire) from public.traducteur_planning p), '[]'::jsonb),
    'intervenants', coalesce((select jsonb_agg(to_jsonb(s) order by s.ordre, s.nom) from public.traducteur_intervenants s), '[]'::jsonb),
    'glossaire', coalesce((select jsonb_agg(to_jsonb(g) order by g.categorie, g.ordre, g.terme_fr) from public.traducteur_glossaire g), '[]'::jsonb),
    'documents', coalesce((select jsonb_agg(to_jsonb(d) order by d.ordre, d.ajoute_le) from public.traducteur_documents d), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.traducteur_login(text, text) to anon, authenticated;

-- L'espace intervenant sait désormais si la personne est traductrice (carte « Mon espace traducteur »)
create or replace function public.intervenant_login(p_dossier text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_row public.intervenants;
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text;
begin
  if v_dossier = '' or v_email = '' then
    return null;
  end if;

  v_cle := 'iv:' || v_dossier;
  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'iv:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select i.* into v_row
  from public.intervenants i
  where lower(i.dossier) = v_dossier
    and ((i.email is not null and lower(btrim(i.email)) = v_email)
         or (i.email_secondaire is not null and lower(btrim(i.email_secondaire)) = v_email))
  limit 1;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_row.id is not null);

  if v_row.id is null then
    return null;
  end if;

  perform public.log_connexion(v_row.dossier, 'intervenant');

  return jsonb_build_object(
    'dossier', v_row.dossier, 'nom', v_row.nom, 'prenom', v_row.prenom,
    'organisation', v_row.organisation, 'fonction', v_row.fonction,
    'interventions', v_row.interventions, 'badge_token', v_row.badge_token,
    'equipe', v_row.equipe, 'photo_url', v_row.photo_url, 'mission', v_row.mission,
    'traducteur', v_row.traducteur
  );
end;
$$;
