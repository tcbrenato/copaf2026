-- Identité à pré-remplir dans l'outil Diagnostic pour une tablette connectée par lien personnel :
-- le participant n'a plus à retaper numéro de dossier, nom, e-mail, port. Réservé au détenteur d'une session valide
-- (non expirée, lien non révoqué) ; renvoie null sinon.
create or replace function public.tablette_identite_diagnostic(p_session text)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_t public.tablet_tokens;
  v_r jsonb;
begin
  if coalesce(p_session, '') !~ '^[A-Za-z0-9_-]{32,128}$' then
    return null;
  end if;

  select t.* into v_t
  from public.tablet_sessions s join public.tablet_tokens t on t.id = s.token_id
  where s.session_hash = encode(digest(p_session, 'sha256'), 'hex') and s.expires_at > now()
    and t.revoked_at is null and (t.expires_at is null or t.expires_at > now());
  if v_t.id is null then
    return null;
  end if;

  select to_jsonb(x) into v_r from (
    select c.prenom, c.nom, c.email, c.telephone, c.organisation, c.pays, c.poste
    from public.inscriptions i join public.contacts c on c.id = i.contact_id
    where v_t.personne_type = 'inscription' and i.dossier = v_t.personne_id
    union all
    select ip.prenom, ip.nom, coalesce(nullif(ip.email, ''), c.email), coalesce(nullif(ip.telephone, ''), c.telephone),
           c.organisation, c.pays, ip.poste
    from public.inscription_participants ip
    join public.inscriptions i on i.id = ip.inscription_id
    join public.contacts c on c.id = i.contact_id
    where v_t.personne_type = 'participant_groupe' and ip.dossier = v_t.personne_id
    union all
    select iv.prenom, iv.nom, iv.email, iv.telephone, iv.organisation, iv.pays, iv.fonction
    from public.intervenants iv
    where v_t.personne_type in ('equipe', 'intervenant') and iv.dossier = v_t.personne_id
    limit 1
  ) x;

  return v_r;
end;
$$;

grant execute on function public.tablette_identite_diagnostic(text) to anon, authenticated;
