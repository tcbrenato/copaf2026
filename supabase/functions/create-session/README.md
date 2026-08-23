# Déploiement — create-session & update-time-on-page

Ces deux fonctions complètent le tracking analytics (`useAnalytics.js`) :

- **create-session** : crée une session en résolvant le pays depuis l'IP réelle du visiteur (au lieu d'un appel géoloc depuis le navigateur, bloqué par de nombreux ad-blockers).
- **update-time-on-page** (dossier voisin) : reçoit, via `sendBeacon` au moment où le visiteur quitte une page, la durée réelle passée dessus et met à jour `page_views.time_on_page` (jusqu'ici toujours à `0`).

## Déployer

```bash
supabase link --project-ref pdtohaxbsgpxccopgnmd
supabase functions deploy create-session
supabase functions deploy update-time-on-page --no-verify-jwt
```

⚠️ Le flag `--no-verify-jwt` sur `update-time-on-page` est nécessaire : `navigator.sendBeacon` ne peut pas poser d'en-tête `Authorization`, donc cette fonction doit accepter les appels non authentifiés. Elle ne fait qu'une mise à jour non sensible (`time_on_page`), donc c'est un risque acceptable — cohérent avec le reste du tracking analytics qui est déjà entièrement public/anonyme.

`create-session`, elle, garde la vérification JWT par défaut : elle est appelée via `supabase.functions.invoke(...)`, qui attache automatiquement la clé anon.

## Secrets requis

`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà disponibles automatiquement dans toutes les Edge Functions Supabase — rien à ajouter dans les secrets pour ces deux fonctions.

## Vérifier après déploiement

1. Ouvrir le site, naviguer sur 2-3 pages, attendre quelques secondes sur chacune.
2. Dans **Admin → Analytics**, la colonne "temps moyen" de `v_top_pages` doit commencer à afficher des valeurs non nulles (peut prendre un rafraîchissement, l'auto-refresh du dashboard tourne toutes les quelques minutes).
3. "Top pays" doit continuer à fonctionner normalement (le pays est maintenant résolu côté serveur mais stocké au même endroit).
