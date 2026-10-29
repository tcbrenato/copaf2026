-- La vérification renvoie le type d'attestation (participant, intervenant, equipe, interprete) : pour les trois derniers,
-- la page publique affiche le document émis (document_url) plutôt que le modèle « participant » généré par le site.

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
    'langue', v_row.langue, 'logo_url', v_row.logo_url, 'document_url', v_row.document_url,
    'type', case when v_row.personne_type in ('intervenant', 'equipe', 'interprete') then v_row.personne_type else 'participant' end
  );
end;
$$;
grant execute on function public.verifier_attestation(text) to anon, authenticated;
