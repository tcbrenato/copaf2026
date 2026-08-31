-- Supabase accorde EXECUTE a anon/authenticated par defaut a la creation d'une fonction
-- (privileges par defaut du projet), donc "revoke all ... from public" ne suffisait pas :
-- il faut revoquer explicitement le role anon (mon_dossier() et owns_dossier() n'ont de
-- sens que pour un utilisateur connecte ; sans session, auth.uid() est null et ces
-- fonctions ne renvoient/ne modifient rien, mais on retire l'acces par principe de
-- moindre privilege).
revoke execute on function public.mon_dossier() from anon;
revoke execute on function public.owns_dossier(text) from anon;
