# Espace traducteurs (`/espace-traducteur`)

Espace bilingue FR/EN pour les trois traducteurs-interprètes FR ↔ EN : 8 cartes d'infos clés (chacune ouvre une fenêtre) et une page Documents.
Tout le contenu se gère dans l'administration, onglet **Traducteurs**, sans toucher au code.

## Accès
- Un traducteur est un compte **intervenant** (INT2026-0xx) dont la case « Traducteur » est cochée (Admin → Intervenants, ou Admin → Traducteurs → « Donner l'accès »).
- Connexion : numéro de dossier + e-mail (comme `/intervenant` et `/espace-equipe`). L'e-mail est obligatoire. Limitation à 8 essais/15 min par dossier, 40/h par IP.
- La fonction `traducteur_login` ne renvoie que le contenu de l'espace et les **noms** des collègues traducteurs : jamais e-mail, téléphone, passeport ni données des autres intervenants.
- Dans l'espace intervenant (`/intervenant`), un traducteur voit une carte « Mon espace traducteur ».

## Contenu (Admin → Traducteurs)
| Section | Rôle |
|---|---|
| Traducteurs | qui a accès, lien de l'espace |
| Contenus | titre et texte FR/EN de chaque carte : conférence, programme (introduction), planning (introduction), intervenants (introduction), glossaire (introduction), logistique, contacts, règles |
| Programme | sessions par jour (jour 3 = visite de terrain au Port de Casablanca, signalée) |
| Planning | session ↔ traducteur, relais |
| Intervenants | nom, fonction, pays, langue d'intervention, session, aide à la prononciation (bouton d'import depuis les intervenants : nom, fonction, pays seulement) |
| Glossaire | termes FR/EN par catégorie (portuaire, IA, cybersécurité, sigles) |
| Documents | fichier, catégorie, langue, statut (Disponible / En attente), date d'ajout |

Mise en forme des textes : `## Sous-titre`, `- puce`, ligne vide = nouveau paragraphe. Les mots « À compléter » / « To be completed » s'affichent en orange pour les traducteurs.

## Documents et notifications
- Catégories : Programme officiel, Carnet de la conférence, Liste des intervenants, Présentations et discours, Glossaire, Plan du lieu et des salles, Note de cadrage, Magazine AMP/MPA.
- « En attente » reste bien visible (badge orange) ; passer un document à « Disponible » avec un fichier le rend téléchargeable. La base enregistre la date du passage à « Disponible » (`disponible_le`).
- À la visite suivante, le traducteur voit un bandeau « N nouveaux documents sont disponibles » et un badge « Nouveau » sur chaque document concerné (référence : sa dernière visite, gardée dans son navigateur).
- Les fichiers sont dans le bucket public `documents-intervenants` (dossier `traducteurs/`), avec un lien non devinable mais sans mot de passe.

## Mise en route
1. Migration `supabase/migrations/20261012100000_espace_traducteurs.sql` (déjà appliquée).
2. Comptes créés : INT2026-013, -014, -015 (e-mails renseignés) ; ajouter leur photo dans Admin → Intervenants.
3. Remplir les « À compléter » : horaires du programme, planning, intervenants, logistique, contacts, glossaire, documents.

## Compatibilité et accessibilité
Mise en page mobile d'abord, utilisable sur tablette Android ancienne (JS/CSS compilés pour Chrome 69, voir `vite.config.js`). Fenêtres accessibles : `role="dialog"`, fermeture par Échap / bouton ✕ / fond, focus piégé puis restitué, défilement de la page bloqué.

## Fichiers
`src/pages/EspaceTraducteur.jsx` · `src/components/traducteur/*` (Modale, Texte, Contenus, Documents, EditeurLignes, traducteurUtils) · `src/pages/AdminTraducteurs.jsx` ·
modifiés : `src/App.jsx`, `src/components/AdminDashboard.jsx`, `src/pages/AdminIntervenants.jsx`, `src/pages/EspaceIntervenant.jsx`.
