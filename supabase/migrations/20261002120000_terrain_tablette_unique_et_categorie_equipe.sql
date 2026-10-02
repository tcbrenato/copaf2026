-- 1) Numero de tablette unique : un meme numero ne peut plus etre attribue a
--    deux personnes (comparaison sans espaces ni casse). Les saisies de test
--    (COPAF1234 x3, COPAF145) sont annulees (annulation logique, historique conserve).
update public.suivi_terrain
   set annule_le = now(), annule_par = 'systeme', motif_annulation = 'Test : numero fictif'
 where etape = 'tablette' and annule_le is null;

create unique index if not exists suivi_terrain_tablette_numero_unique
  on public.suivi_terrain (upper(regexp_replace(valeur, '\s+', '', 'g')))
  where etape = 'tablette' and annule_le is null;

-- terrain_marquer : meme corps que 20260929090100 + refus explicite d'un numero deja attribue.
create or replace function public.terrain_marquer(
  p_personne_type text, p_personne_id text, p_etape text, p_jour date,
  p_valeur text, p_mode text, p_fait_par text,
  p_dossier text default null, p_pin text default null
)
returns table(id uuid, deja_fait boolean)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_compte text;
  v_niveau text := public._terrain_niveau(p_dossier, p_pin);
  v_auteur text;
  v_num text := upper(regexp_replace(coalesce(p_valeur, ''), '\s+', '', 'g'));
  v_autre text;
begin
  if p_etape = 'tablette' then
    if v_num = '' then
      raise exception 'Numero de tablette requis';
    end if;
    select st.personne_id into v_autre from public.suivi_terrain st
    where st.etape = 'tablette' and st.annule_le is null
      and upper(regexp_replace(st.valeur, '\s+', '', 'g')) = v_num
      and not (st.personne_type = p_personne_type and st.personne_id = p_personne_id)
    limit 1;
    if v_autre is not null then
      raise exception 'Numero de tablette deja attribue (%)', v_autre;
    end if;
  end if;

  select email into v_compte from public.admins where user_id = auth.uid();
  v_auteur := case when v_niveau = 'limite'
    then (select prenom from public.intervenants where lower(dossier) = lower(p_dossier))
    else coalesce(nullif(btrim(p_fait_par), ''), v_compte, 'Inconnu')
  end;

  insert into public.suivi_terrain (personne_type, personne_id, etape, jour, valeur, mode, fait_par, compte)
  values (
    p_personne_type, p_personne_id, p_etape, p_jour, nullif(btrim(p_valeur), ''),
    coalesce(nullif(p_mode, ''), 'manuel'), v_auteur, coalesce(v_compte, p_dossier)
  )
  on conflict (personne_type, personne_id, etape, coalesce(jour, '1970-01-01'::date)) where annule_le is null
  do nothing
  returning suivi_terrain.id into v_id;

  if v_id is not null then
    return query select v_id, false;
    return;
  end if;

  select st.id into v_id from public.suivi_terrain st
  where st.personne_type = p_personne_type and st.personne_id = p_personne_id
    and st.etape = p_etape and coalesce(st.jour, '1970-01-01'::date) = coalesce(p_jour, '1970-01-01'::date)
    and st.annule_le is null;

  return query select v_id, true;
end;
$$;
revoke execute on function public.terrain_marquer(text, text, text, date, text, text, text, text, text) from public;
grant execute on function public.terrain_marquer(text, text, text, date, text, text, text, text, text) to anon, authenticated;

-- 2) 3e interrupteur de visibilite : la categorie « Equipe / Comite » (organisation)
alter table public.terrain_masques_categories drop constraint if exists terrain_masques_categories_categorie_check;
alter table public.terrain_masques_categories
  add constraint terrain_masques_categories_categorie_check check (categorie in ('participant', 'intervenant', 'organisation'));
