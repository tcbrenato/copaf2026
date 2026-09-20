-- Deuxieme temps du durcissement : retraits d'acces, a appliquer APRES le deploiement
-- du site qui utilise analytics_track_view / analytics_identify / sg_inscriptions.

-- statistiques : plus de lecture ni d'ecriture publiques directes
drop policy if exists update_public on public.sessions;
drop policy if exists select_public on public.sessions;
drop policy if exists select_public on public.page_views;
drop policy if exists select_public on public.events;
drop policy if exists insert_public on public.page_views;

-- suivi SG : plus d'acces direct a la vue, ni au journal d'acces appelable par tous
revoke all on public.v_sg_inscriptions from anon, authenticated;
revoke execute on function public.public_log_sg_access() from public, anon, authenticated;
