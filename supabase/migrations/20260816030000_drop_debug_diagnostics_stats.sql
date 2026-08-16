-- Retrait de la fonction de debug temporaire (20260816020000), son role
-- etait uniquement de verifier ponctuellement l'etat de public.diagnostics.
drop function if exists public.debug_diagnostics_stats();
