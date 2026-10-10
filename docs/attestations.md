# Attestations de participation : vérification publique, codes et QR

## Ce que fait le module
- **Page publique** `copaf-ports.com/verifier/COPAF-2026-EXEC-XXXX` (adresse encodée dans le QR de chaque attestation) : message neutre si le numéro
  n'existe pas, « Attestation en cours de préparation » avant le 21/10/2026 tant que la personne n'est pas publiée, sinon bandeau
  « ✔ Attestation authentique » + attestation HTML imprimable (A4 paysage), boutons PDF / Imprimer / Copier le lien, bascule FR/EN
  (langue de la personne par défaut), drapeau du pays (`flagcdn.com`), logo de l'autorité si renseigné. Pages `noindex`.
- **Entrée `/verifier`** : le champ de recherche existant reconnaît un numéro d'attestation (en plus du n° de dossier et de l'IBAN) et ouvre sa
  vérification ; un bouton permet de scanner le QR code à la caméra.
- **Administration → onglet « Attestations »** : liste (recherche, filtres pays/langue/autorité, tri, modification, ajout, suppression),
  import Excel/CSV, import depuis les inscrits, génération des codes, QR en lot, exports, PDF en lot, publication.

## Procédure : import → codes → QR → publication
1. **Importer** : « Importer Excel / CSV » (modèle : « Télécharger le modèle ») avec les colonnes `Civilité | Prénom | Nom | Fonction | Autorité portuaire | Pays`,
   ou « Importer depuis les inscrits ». Un aperçu signale erreurs, avertissements (civilité, pays inconnu…) et doublons (prénom + nom + autorité) avant l'import.
2. **Contrôler** la langue (FR/EN) et le pays de chaque ligne : modifiables ligne par ligne. La règle automatique est dans `src/utils/attestationsConfig.js`
   (francophones → FR, anglophones et lusophones → EN, pays inconnu → FR).
3. **Générer les codes manquants** : `COPAF-2026-EXEC-` + 4 caractères aléatoires sans O/0/I/1, uniques.
4. **Exporter les QR** (ZIP : dossiers `PNG/` et `SVG/` nommés `{code}_{NOM}`, plus `liste_qr.csv` = Code, Prénom, Nom, URL, Nom du fichier QR ; correction d'erreur H),
   **la liste** (Excel/CSV : Prénom, Nom, Fonction, Autorité portuaire, Pays, Langue, Code, URL de vérification) et, si besoin, **les attestations PDF** (ZIP, une par personne, dans sa langue, avec son QR).
   Les exports portent sur les lignes cochées, sinon sur la liste filtrée.
5. **Publier** (cases « Publié », ou bouton « Publier » pour la sélection/la liste) : les attestations s'affichent avant le 21/10/2026 seulement si elles sont publiées ;
   à partir du 21/10/2026 (heure de Casablanca), toutes les attestations ayant un code s'affichent.

## Sécurité
- Table `attestations` : écriture réservée aux admins (RLS) ; le public passe uniquement par la fonction `verifier_attestation`, qui ne renvoie ni e-mail ni téléphone.
- Limitation de débit : 10 vérifications par minute et par adresse IP (300 par minute au total). Codes aléatoires (4 caractères parmi 32 : environ 1 million de combinaisons),
  donc ils ne sont pas devinables en pratique avec cette limitation, mais ce n'est pas un secret : n'y rattachez aucune donnée sensible.

## Fichiers
`supabase/migrations/20261010100000_attestations.sql` · `src/pages/VerifierAttestation.jsx` · `src/components/AttestationView.jsx` · `src/components/ScanAttestation.jsx` ·
`src/pages/AdminAttestations.jsx` · `src/utils/attestationsConfig.js` · `src/utils/attestationsTextes.js` · `src/utils/generateAttestationPDF.js` · `src/utils/tableur.js` ·
modifiés : `src/pages/VerifierDossier.jsx`, `src/App.jsx`, `src/components/AdminDashboard.jsx`.

## Tester en local
```bash
npm install
node tests/attestations-config.test.mjs   # codes, pays, langues, doublons
node tests/tableur.test.mjs               # lecture/écriture xlsx et csv
npm run dev                               # puis http://localhost:5173/verifier/COPAF-2026-EXEC-XXXX (la base Supabase du projet est utilisée)
```
