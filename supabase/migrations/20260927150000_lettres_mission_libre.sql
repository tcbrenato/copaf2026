-- Permet de creer une lettre de mission pour une personne pas encore
-- accreditee comme intervenant (ex. membre d'equipe fraichement recrute) :
-- l'admin saisit nom/fonction/organisation directement dans le formulaire
-- au lieu de les reprendre d'une fiche intervenant existante. Colonnes
-- utilisees uniquement quand le dossier ne correspond a aucune ligne dans
-- la table intervenants (voir AdminLettreMission.jsx).
alter table public.lettres_mission add column nom_libre text;
alter table public.lettres_mission add column prenom_libre text;
alter table public.lettres_mission add column fonction_libre text;
alter table public.lettres_mission add column organisation_libre text;
