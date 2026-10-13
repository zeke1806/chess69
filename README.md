# Chess69

Application Android française entièrement locale pour débutants et joueurs intermédiaires : huit ouvertures et 24 variantes guidées/mémorisables, 120 puzzles, 24 finales, parties contre Stockfish et analyse progressive. SQLite conserve la progression propre à cette installation, sans compte, serveur métier, télémétrie ou téléchargement initial.

Téléchargement : [APK et instructions](https://apk.rentabe.ovh/chess69). Ouvrir la nouvelle APK et accepter **Mettre à jour**, sans désinstaller. Package et certificat sont conservés. La progression disparaît après désinstallation ou effacement des données.

## Développer et vérifier

Node 24 (`.nvmrc`) et npm ; versions exactes dans le lockfile.

```bash
npm ci
npm run typecheck
npm test
npx expo install --check
npx expo-doctor
```

Les tests rapides utilisent les contrats publics et des adaptateurs en mémoire, sans réseau, disque, SQLite natif ou moteur réel. Le fonctionnement natif exige Android ; un navigateur ou Expo Go ne remplace pas l’APK.

## Compiler et distribuer

[Procédure Android](docs/android-release.md) : setup macOS, identité/signature, récupération de clé, build et validation. `npm run android:build` produit la release ARM64 signée. Ne pas exécuter prebuild --clean : le projet natif est maintenu explicitement.

Le module Expo local contient Stockfish 17.1 C++/JNI et ses NNUE ; le catalogue est embarqué. Les sources GPL correspondantes et les instructions de [recompilation](docs/source-release.md) accompagnent la release publique. La clé privée reste sur le Mac. La publication appartient à `vps-perso` ; elle conserve seulement la dernière APK après vérification complète du téléchargement.

## Test sur le Galaxy S22 Ultra

Voir [installation/mise à jour et protocole court](.scratch/application-locale/phone-test.md). Activer le mode avion, résoudre un exercice, reprendre une partie après arrêt forcé et analyser l’historique. Les [preuves de livraison](.scratch/application-locale/verification.md) distinguent tests rapides, Android ARM64 émulé et contrôles Samsung restant à effectuer. Le premier retour téléphone validait l’ancienne APK 0.1.0 ; il ne valide pas encore cette nouvelle application.
