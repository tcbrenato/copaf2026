# Déploiement — notify-telegram-inscription

Notifie l'équipe COPAF sur Telegram à chaque nouvelle inscription (table `inscriptions`, événement `INSERT`).

## 1. Déployer la fonction

Depuis un terminal, à la racine du projet :

```bash
supabase login
supabase link --project-ref pdtohaxbsgpxccopgnmd
supabase functions deploy notify-telegram-inscription
```

## 2. Ajouter les secrets

Il faut un bot Telegram (créé via [@BotFather](https://t.me/BotFather), qui donne le `TELEGRAM_BOT_TOKEN`) et l'identifiant du chat/groupe où envoyer les notifications (`TELEGRAM_CHAT_ID` — pour un groupe, ajoutez le bot au groupe puis récupérez l'ID via `https://api.telegram.org/bot<TOKEN>/getUpdates` après avoir envoyé un message dans le groupe).

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:AAAbcdEFghijKLmnoPQRstuVWxyz
supabase secrets set TELEGRAM_CHAT_ID=-1001234567890
```

## 3. Configurer le Database Webhook

Dans **Supabase Studio** → **Database** → **Webhooks** → **Create a new webhook** :

| Champ | Valeur |
|---|---|
| Name | `notify-telegram-inscription` |
| Table | `inscriptions` |
| Events | `INSERT` uniquement (décochez Update/Delete) |
| Type | `Supabase Edge Functions` (ou `HTTP Request` selon la version de Studio) |
| Edge Function | `notify-telegram-inscription` |
| HTTP Method | `POST` |
| HTTP Headers | `Authorization: Bearer <votre clé anon ou service_role>` |

Si Studio propose de choisir la fonction directement dans une liste déroulante, l'URL et l'en-tête `Authorization` sont pré-remplis automatiquement. Sinon, renseignez manuellement :

- **URL** : `https://pdtohaxbsgpxccopgnmd.supabase.co/functions/v1/notify-telegram-inscription`
- **Header** : `Authorization: Bearer <clé anon du projet>`

## 4. Tester

Créez une inscription de test (via le formulaire du site, ou une insertion manuelle dans `inscriptions` depuis le SQL Editor) et vérifiez que le message arrive sur Telegram. En cas d'échec, les logs sont visibles dans **Supabase Studio → Edge Functions → notify-telegram-inscription → Logs** (l'insertion elle-même n'est jamais bloquée par un souci Telegram, voir le commentaire en tête de `index.ts`).
