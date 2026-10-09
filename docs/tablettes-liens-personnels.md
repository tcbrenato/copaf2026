# Tablettes : connexion automatique par lien court personnel

Chaque participant a un lien court unique `https://copaf-ports.com/t/CODE` (CODE = 10 caractères, insensible à la casse, sans caractères
ambigus : pas de 0, O, 1, I, L). Ouvert une fois sur sa tablette, il la connecte pour 30 jours (prolongés à chaque visite), sans mot de passe,
puis redirige vers `/tablette` : le code disparaît de la barre d'adresse. L'ancien format long `/tablette?t=JETON` reste accepté.

## Générer les liens
1. Administration → onglet **Tablettes** (ou `copaf-ports.com/admin/tablettes`).
2. Cochez les personnes (bouton « Sélectionner les personnes sans lien actif » pour tout le monde), date d'expiration facultative,
   puis **Générer les liens**.
3. Les codes, liens et QR codes ne sont affichés **qu'une seule fois** : cliquez **Exporter le CSV** (participant, code, lien, statut)
   ou **Copier tous les liens** avant de fermer la fenêtre. La base ne conserve que l'empreinte SHA-256 des codes.
4. Transmettez à chaque participant SON lien (ou son code : `copaf-ports.com/t/` puis les 10 caractères). « Exporter l'état » donne ensuite le suivi.

## Configurer une tablette
1. Ouvrir le lien (ou le taper, ou scanner son QR code) dans Chrome. La page affiche le nom du participant : la tablette est connectée.
2. Menu ⋮ → **Ajouter à l'écran d'accueil** → ouvrir l'icône « COPAF Tablette » : elle s'ouvre directement connectée.

## Révoquer / régénérer
- Onglet **Tablettes** → **Révoquer** (tablette perdue) : la tablette est déconnectée au plus tard 5 minutes plus tard (ou à sa prochaine ouverture).
- **Régénérer** : révoque l'ancien lien et en crée un nouveau (à renvoyer au participant).
- Lien invalide, révoqué ou expiré : la tablette affiche « Lien invalide ou expiré » avec le contact de l'organisation.

## Sécurité (et limites)
- Code court : 10 caractères tirés au hasard (pgcrypto, sans biais) dans 31 symboles, soit environ 49 bits : suffisant grâce à une limitation de débit stricte,
  mais moins résistant qu'un long jeton. Session : jeton aléatoire distinct de 32 octets. Seules les empreintes SHA-256 sont stockées.
- Limitation de débit : 8 échecs en 15 minutes ou 20 en 1 heure par adresse IP → blocage temporaire ; 200 échecs par heure toutes adresses confondues → blocage de la route.
  Les codes ne sont jamais journalisés par l'application.
- Tables inaccessibles directement (RLS sans politique) : tout passe par `tablette_connecter`, `tablette_session` et `admin_tablette_*` (admin uniquement).
- Le site est statique (hébergé sur Hostinger, sans serveur d'application) : la session est gardée dans le stockage local de la tablette
  et non dans un cookie `httpOnly`. Elle est revérifiée côté base toutes les 5 minutes et à chaque ouverture, donc révocable immédiatement.
- Le code apparaît dans l'adresse au moment de l'ouverture du lien, donc dans les journaux d'accès de l'hébergeur : traitez un lien comme un mot de passe.

## Compatibilité
Le code est compilé pour Chrome 69 / Android 8.1 (`build.target` dans `vite.config.js`, `browserslist` dans `package.json`), avec les
correctifs de `src/polyfills.js` (dont mode allégé et conversion du `gap` des conteneurs flex). Écran de secours « Recharger » si le script ne démarre pas,
bandeau « Connexion perdue » et rechargement automatique au retour du réseau.

## Fichiers
`supabase/migrations/20261009180000_tablette_liens_personnels.sql` et `20261009200000_tablette_codes_courts.sql` · `src/utils/tabletteSession.js` ·
`src/pages/TabletteHub.jsx` · `src/pages/AdminTablettes.jsx` · `public/tablette.webmanifest` · `index.html` (capture du code, écran de secours)
