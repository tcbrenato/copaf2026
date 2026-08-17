-- Retrait de la fonction de debug temporaire (20260817040000), son role
-- etait uniquement de verifier ponctuellement l'etat de public.diagnostics
-- suite a la disparition inexpliquee d'un diagnostic reel.
drop function if exists public.debug_diagnostics_list();
