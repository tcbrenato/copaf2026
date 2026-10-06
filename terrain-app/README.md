# COPAF Terrain (Android)

Enveloppe Android très simple : une application qui ouvre `https://copaf-ports.com/terrain` en plein écran
(l'application elle-même est le site, donc les mises à jour arrivent sans réinstaller).

Le fichier APK est construit par GitHub Actions (`.github/workflows/build-apk-terrain.yml`, lancement manuel),
puis déposé dans `public/downloads/COPAF-Terrain.apk` et proposé sur la page `/terrain-app`.
Signature : clé de debug Android (installation directe, hors boutique).
