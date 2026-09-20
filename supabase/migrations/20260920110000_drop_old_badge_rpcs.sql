-- Anciennes RPC de /badge (lecture par dossier seul + jeton du badge) : supprimees,
-- remplacees par badge_login / badge_update (dossier + secret personnel).
drop function if exists public.badge_lookup_by_dossier(text);
drop function if exists public.badge_upload_url(uuid, text, text);
