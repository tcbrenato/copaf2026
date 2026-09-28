-- Audit securite avant l'evenement.
--
-- 1. lettre_mission_public(p_dossier) etait appelable sans connexion avec le seul
--    numero de dossier (INT2026-001...) : nom, pays, itineraire et NUMERO DE PASSEPORT
--    enumerables. La fonction exige desormais l'email de l'intervenant (comme
--    intervenant_login), avec le meme plafond de tentatives. Le numero complet est
--    conserve : il figure sur la lettre officielle.
-- 2. Les fonctions trigger n'ont pas a etre exposees en RPC.
-- 3. search_path fixe sur les fonctions signalees ; analytics reservees aux connectes.

drop function if exists public.lettre_mission_public(text);

create or replace function public.lettre_mission_public(p_dossier text, p_email text)
returns table(
  dossier text, qualite text, qualite_autre text, role_attributions text,
  date_debut date, date_fin date, itineraire text,
  frais_transport boolean, frais_hebergement boolean, frais_restauration boolean, frais_transferts boolean,
  reference text, lieu_signature text,
  nom text, prenom text, fonction text, organisation text, pays text, numero_passeport text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_dossier text := lower(btrim(coalesce(p_dossier, '')));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_headers json := coalesce(nullif(current_setting('request.headers', true), '')::json, '{}'::json);
  v_ip text := coalesce(nullif(v_headers->>'cf-connecting-ip', ''), nullif(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1), ''), 'inconnue');
  v_cle text := 'lm:' || v_dossier;
  v_ok boolean;
begin
  if v_dossier = '' or v_email = '' then
    return;
  end if;

  if (select count(*) from public.badge_login_attempts where cle = v_cle and not success and created_at > now() - interval '15 minutes') >= 8
     or (select count(*) from public.badge_login_attempts where ip = v_ip and cle like 'lm:%' and not success and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Trop de tentatives, reessayez plus tard';
  end if;

  select exists (
    select 1 from public.intervenants i
    where lower(i.dossier) = v_dossier and i.email is not null and lower(btrim(i.email)) = v_email
  ) into v_ok;

  insert into public.badge_login_attempts (cle, ip, success) values (v_cle, v_ip, v_ok);

  if not v_ok then
    return;
  end if;

  return query
    select lm.dossier, lm.qualite, lm.qualite_autre, lm.role_attributions,
           lm.date_debut, lm.date_fin, lm.itineraire,
           lm.frais_transport, lm.frais_hebergement, lm.frais_restauration, lm.frais_transferts,
           lm.reference, lm.lieu_signature,
           coalesce(lm.nom_libre, iv.nom), coalesce(lm.prenom_libre, iv.prenom),
           coalesce(lm.fonction_libre, iv.fonction), coalesce(lm.organisation_libre, iv.organisation),
           iv.pays, iv.numero_passeport
    from public.lettres_mission lm
    join public.intervenants iv on lower(iv.dossier) = lower(lm.dossier)
    where lower(lm.dossier) = v_dossier and lm.statut in ('prete', 'envoyee');
end;
$$;

revoke execute on function public.trigger_notify_email_inscription() from public, anon, authenticated;
revoke execute on function public.trigger_notify_telegram_inscription() from public, anon, authenticated;
revoke execute on function public.log_activity() from public, anon, authenticated;
revoke execute on function public.block_manager_financial_edit() from public, anon, authenticated;
revoke execute on function public.set_diagnostic_is_dg() from public, anon, authenticated;

alter function public.diagnostic_room_key(text, text, text, text) set search_path = public;
alter function public.is_dg_from_poste(text) set search_path = public;
alter function public.set_diagnostic_is_dg() set search_path = public;
alter function public.get_top_pages(timestamptz, timestamptz) set search_path = public;
alter function public.get_funnel(timestamptz, timestamptz) set search_path = public;

revoke execute on function public.get_top_pages(timestamptz, timestamptz) from public, anon;
revoke execute on function public.get_funnel(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_top_pages(timestamptz, timestamptz) to authenticated;
grant execute on function public.get_funnel(timestamptz, timestamptz) to authenticated;
