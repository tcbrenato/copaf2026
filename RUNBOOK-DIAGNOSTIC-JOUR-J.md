# Runbook Jour J — Diagnostic Smart Port (COPAF 2026)

Document de poche pour la personne qui pilote le Diagnostic Smart Port sur place (19-22 octobre 2026). Objectif : ne jamais avoir à chercher où cliquer en pleine session.

---

## 1. Les 3 URLs à connaître

| Écran | URL | Usage |
|---|---|---|
| **Diagnostic (répondants)** | `https://copaf-ports.com/diagnostic` | À donner aux participants sur leurs tablettes/téléphones. |
| **Admin** | `https://copaf-ports.com/admin` → onglet **Diagnostics** | Suivi en direct, export CSV, suppression, KPI. Réservé à l'équipe. |
| **Mode projection** | `https://copaf-ports.com/diagnostic/projection` | Écran plein écran pour le vidéoprojecteur/écran de salle. Accessible directement (pas besoin d'être connecté), ou via le bouton **"Mode projection ↗"** en haut de l'onglet Diagnostics dans l'admin. |

Astuce : mettre les 3 liens en favoris/raccourci sur l'appareil qui sert le jour J, pour ne pas avoir à les retaper.

## 2. Connexion admin

- Identifiant : `contact@copaf-ports.com`
- Mot de passe : voir `RUNBOOK-JOUR-J-PRIVE.md` (fichier local, non commité — à demander à qui a le repo sur sa machine si vous ne l'avez pas)
- Authentification via Supabase Auth (email + mot de passe classique, pas de lien magique). Si le mot de passe est perdu, il peut être réinitialisé depuis le dashboard Supabase (Authentication → Users).

## 3. Séquence recommandée le jour J

1. **La veille ou tôt le matin** : ouvrir `/diagnostic` sur une tablette de test et faire un diagnostic complet de bout en bout (soumission réelle), pour vérifier que le wifi de la salle fonctionne avec Supabase. Supprimer ensuite ce test depuis l'admin (bouton 🗑️ sur la ligne correspondante).
2. **Avant que les participants ne commencent à répondre** : brancher l'ordinateur/la tablette qui pilote l'écran de la salle, ouvrir `/diagnostic/projection` en plein écran (F11 dans la plupart des navigateurs), et le laisser affiché. L'écran affichera "En attente des premières réponses" — c'est normal et volontaire : ça montre que le direct est déjà actif avant même que les gens commencent, ce qui donne confiance.
3. **Pendant la session** : distribuer le lien `/diagnostic` aux participants. Rien à faire côté projection — les moyennes et le radar se mettent à jour tout seuls dès la première soumission, et l'écran bascule automatiquement entre "Tous les ports" et chaque réseau régional toutes les 14 secondes.
4. **En parallèle**, garder `/admin` → Diagnostics ouvert sur un second appareil pour surveiller le flux en direct (liste "Activité en direct", KPI) et repérer un souci (ex. une soumission qui semble être un test, un score suspect) sans perturber l'écran de projection.
5. **Après la session** : exporter le CSV depuis l'admin (bouton "Exporter en CSV") pour archivage, avant toute suppression éventuelle de données de test.

## 4. Que faire en cas de problème

| Problème | Réflexe |
|---|---|
| **Pas de wifi / connexion instable** | Basculer sur le partage de connexion (hotspot) d'un téléphone avec un bon forfait data. Le diagnostic nécessite une connexion internet active (Supabase) — il n'y a pas de mode hors-ligne. |
| **Une tablette plante ou la page se recharge en cours de diagnostic** | Les réponses ne sont enregistrées qu'à la toute fin (soumission finale) — rien n'est sauvegardé en cours de route. Il faut relancer `/diagnostic` et recommencer depuis le début. Conseil : garder les tablettes branchées/chargées et désactiver la mise en veille automatique avant la session. |
| **Le port du répondant n'apparaît pas dans la liste déroulante** | Utiliser l'option **"Autre"** en bas de la liste des organisations → saisie libre du nom du port et du pays. Le diagnostic reste comptabilisé normalement, juste sans identifiant stable de réseau régional. |
| **L'écran de projection reste bloqué ou vide** | Rafraîchir la page (F5). Elle se reconnecte automatiquement au direct (Supabase Realtime) et recharge les moyennes à jour. |
| **Une soumission suspecte / test à supprimer** | Admin → Diagnostics → ouvrir la ligne concernée → icône 🗑️ → confirmer. |
| **Doute sur un chiffre affiché** | Les moyennes (admin + projection) ne portent que sur les diagnostics soumis entre le **15/09/2026 00:00 UTC** et le **18/09/2026 00:00 UTC** — un test fait en dehors de cette fenêtre n'apparaîtra jamais dans les agrégats en direct (comportement volontaire, pas un bug). |

## 5. Contact en cas de blocage technique pendant l'événement

- Email général : **contact@copaf-ports.com**
- **TCHOBO Yves Rénato** : +229 01 69 02 43 49 ou +229 01 92 37 77 77
- **Dr ODAH** : +1 (240) 978-4155
- **ELIRAM ODAH** : +1 (240) 854-3661

---
*Document à imprimer ou garder ouvert sur un téléphone séparé pendant l'événement — ne dépend pas du wifi de la salle pour être consulté.*
