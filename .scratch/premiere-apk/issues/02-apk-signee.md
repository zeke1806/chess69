# APK Android autonome et signée

Status: resolved
Blocked by: 01-ecran

Livrer une release 0.1.0 (1), identité ovh.rentabe.chess69, ARM64,
avec bundle embarqué. Installer les outils Android locaux, conserver la clé
durable hors Git et documenter sa récupération et les commandes de build.

Interface de validation : APK produite, apksigner, aapt et inspection ZIP.
L'installation sur le Galaxy reste à confirmer par l'utilisateur.

## Comments

- Aucun package Android ni clé existante trouvé dans ce dépôt neuf ; aucun
  conflit connu avec cette identité dans les documents des deux projets.
- Base de revue application : c8e72d6aa93b1542088feb34bc8cad5fc49f5224.

- Compilation release native réussie ; signature v2/v3 vérifiée, ARM64/API 24,
  identité et versions conformes, bundle Hermes 2 147 060 octets, alignement 16 Kio.
- Fichier : 40 248 544 octets ; empreintes dans ../release.json.
- Clé hors Git avec copie locale protégée, procédure docs/android-release.md.
- Voir ../verification.md pour les deux erreurs d'outillage corrigées.
