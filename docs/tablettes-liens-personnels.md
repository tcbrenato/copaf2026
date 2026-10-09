# Tablettes : connexion automatique par lien personnel

Chaque participant a un lien unique `https://copaf-ports.com/tablette?t=JETON`. Ouvert une fois sur sa tablette, il le connecte
pour 30 jours (prolongés à chaque visite), sans mot de passe. Le jeton disparaît de la barre d'adresse dès l'ouverture.

## Générer les liens
1. Administration → onglet **Tablettes** (ou `copaf-ports.com/admin/tablettes`).
2. Cochez les personnes (bouton « Sélectionner les personnes sans lien actif » pour tout le monde), date d'expiration facultative,
   puis **Générer les liens**.
3. Les liens, avec leur QR code, ne sont affichés **qu'une seule fois** : cliquez **Exporter le CSV** (participant, dossier, lien, statut)
   ou **Copier tous les liens** avant de fermer la fenêtre. La base ne conserve que l'empreinte SHA-256 des jetons.
4. Transmettez à chaque participant SON lien. « Exporter l'état » donne ensuite le suivi (sans les liens).

## Configurer une tablette
1. Ouvrir le lien personnel dans Chrome (ou scanner son QR code). La page affiche le nom du participant : la tablette est connectée.
2. Menu ⋮ → **Ajouter à l'écran d'accueil** → ouvrir l'icône « COPAF Tablette » : elle s'ouvre directement connectée.

## Révoquer / régénérer
- Onglet **Tablettes** → **Révoquer** (tablette perdue) : la tablette est déconnectée au plus tard 5 minutes plus tard (ou à sa prochaine ouverture).
- **Régénérer** : révoque l'ancien lien et en crée un nouveau (à renvoyer au participant).
- Lien invalide, révoqué ou expiré : la tablette affiche « Lien invalide ou expiré » avec le contact de l'organisation.

## Sécurité (et limites)
- Jeton : 32 octets aléatoires (pgcrypto), URL-safe ; session : autre jeton aléatoire de 32 octets ; seules les empreintes SHA-256 sont stockées.
- Limitation de débit : 30 jetons invalides par heure et par adresse IP ; les jetons ne sont jamais journalisés par l'application.
- Tables inaccessibles directement (RLS sans politique) : tout passe par `tablette_connecter`, `tablette_session` et `admin_tablette_*` (admin uniquement).
- Le site est statique (hébergé sur Hostinger, sans serveur d'application) : la session est donc gardée dans le stockage local de la tablette
  et non dans un cookie `httpOnly`. Elle est revérifiée côté base toutes les 5 minutes et à chaque ouverture, donc révocable immédiatement.
- Le jeton apparaît dans l'adresse au moment de l'ouverture du lien, donc dans les journaux d'accès de l'hébergeur : traitez un lien comme un mot de passe.

## Compatibilité
Le code est compilé pour Chrome 69 / Android 8.1 (`build.target` dans `vite.config.js`, `browserslist` dans `package.json`), avec les
correctifs de `src/polyfills.js` (dont mode allégé et conversion du `gap` des conteneurs flex). Écran de secours « Recharger » si le script ne démarre pas,
bandeau « Connexion perdue » et rechargement automatique au retour du réseau.

## Fichiers
`supabase/migrations/20261009180000_tablette_liens_personnels.sql` · `src/utils/tabletteSession.js` · `src/pages/TabletteHub.jsx` ·
`src/pages/AdminTablettes.jsx` · `public/tablette.webmanifest` · `index.html` (capture du jeton, écran de secours)
