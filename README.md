# Chess69

Application Android française entièrement locale pour débutants et joueurs intermédiaires : huit ouvertures et 24 variantes guidées/mémorisables, 120 puzzles, 24 finales, parties contre Stockfish et analyse progressive. SQLite conserve la progression propre à cette installation, sans compte, serveur métier, télémétrie ou téléchargement initial.

Téléchargement : [APK et instructions](https://apk.rentabe.ovh/chess69). Ouvrir la nouvelle APK et accepter **Mettre à jour**, sans désinstaller. Package et certificat sont conservés. La progression disparaît après désinstallation ou effacement des données.

## Développer et vérifier

Node 24 (`.nvmrc`) et npm ; versions exactes dans le lockfile.

Le [mode de travail](docs/mode-de-travail.md) articule les workflows Matt Pocock,
le skill [CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md) pour l’architecture
et les normes de codage, et Impeccable pour l’interface. Les
[choix technologiques](docs/architecture-techno.md) restent propres à Chess69.
L’[audit CU-ARCHI](docs/audit-cu-archi.md) conserve le constat initial et le bilan des corrections A1–A9/D1 appliquées.

```bash
npm ci
npm run typecheck
npm test
npm run format:check
npm run check:architecture
npm run storybook:build
npx expo install --check
npx expo-doctor
```

Les tests rapides utilisent les contrats publics et des dépendances injectées, sans réseau ni moteur natif. Les tests de stockage utilisent un double du protocole Expo en mémoire, sans driver réel ni fichier de données.

Pour inspecter l’interface dans un navigateur, lancer `npm run storybook:dev`
depuis la racine du dépôt, puis ouvrir [http://localhost:6006](http://localhost:6006).
Le catalogue `Common` / `Business` présente les composants et les écrans complets
sous `Business/Pages/Application`. La commande **Largeur** permet de comparer
360, 412 et 480 px. Les stories utilisent les mêmes vues stateless que
l’application Android. `npm run storybook:build` produit `storybook-static/`.
Les états se consultent story par story. La politique de validation visuelle est définie dans CU Archi ; les tests dans un vrai navigateur nécessitent une demande explicite.
Voir [.storybook/README.md](.storybook/README.md) pour le catalogue et ses contrôles.
Le rendu web s’inspecte sans appareil Android ; les preuves natives exigent l’APK.

Les [preuves CU-ARCHI 0.2.1](.scratch/corrections-cu-archi/verification.md) couvrent cette livraison locale et sa mise à jour sans effacement. Elles complètent les preuves de la version publique 0.2.0.

## Compiler et distribuer

[Procédure Android](docs/android-release.md) : setup macOS, identité/signature, récupération de clé, build et validation. `npm run android:build` produit la release ARM64 signée. Ne pas exécuter prebuild --clean : le projet natif est maintenu explicitement.

Le module Expo local contient Stockfish 17.1 C++/JNI et ses NNUE ; le catalogue est embarqué. Les sources GPL correspondantes et les instructions de [recompilation](docs/source-release.md) accompagnent la release publique. La clé privée reste sur le Mac. La publication appartient à `vps-perso` ; elle conserve seulement la dernière APK après vérification complète du téléchargement.

## Test sur le Galaxy S22 Ultra

Voir [installation/mise à jour et protocole court](.scratch/application-locale/phone-test.md). Activer le mode avion, résoudre un exercice, reprendre une partie après arrêt forcé et analyser l’historique. Les [preuves de livraison](.scratch/application-locale/verification.md) distinguent tests rapides, Android ARM64 émulé et contrôles Samsung restant à effectuer. Le premier retour téléphone validait l’ancienne APK 0.1.0 ; il ne valide pas encore cette nouvelle application.
