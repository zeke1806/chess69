# Technologies de Chess69

Ce document conserve les choix technologiques et les contraintes de Chess69.
Les règles d’architecture et les normes de codage sont maintenues dans le skill
[CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md).
Son projet de référence illustre les règles ; ses choix de stack ne remplacent
pas les technologies retenues ici.

## Technologies retenues

| Technologie | Usage | Statut |
| --- | --- | --- |
| React Native | Application mobile Android et composants natifs | Installé ; première APK 0.1.0 |
| React | Composition de l’interface et réactivité | Installé avec React Native |
| Expo | Outillage et modules Android, compilation d’une APK autonome | Installé ; première APK 0.1.0 |
| TypeScript en mode strict | Contrats, types et vérification statique | Configuré en mode strict |
| Zod | Validation des données à l’exécution et types inférés depuis les schémas | Installé ; catalogue, état persisté et évaluations moteur validés |
| Remeda | Transformations fonctionnelles et utilitaires purs | Installé ; utilisé pour les transitions immuables et collections |
| Git | Historique du projet | Initialisé, branche `main` |
| GitHub | Dépôt distant | `zeke1806/chess69`, remote `origin` configuré |

Aucune bibliothèque de conteneur DI ou de gestion d’état supplémentaire n’est
installée. Le raccordement React utilise un adaptateur `stateful` générique avec
`createInitialState` et `connect`. Les parcours possèdent leurs modules de
présentation, assemblés par le module d’orchestration de Chess69.

## Briques confirmées

| Technologie | Usage | Statut |
| --- | --- | --- |
| Expo Router | Routes raccordées aux features | Installé ; routes dans src/app |
| SQLite via `expo-sqlite` | Persistance locale derrière `RepositoryService` | Installé ; ports par parcours, adaptateurs SQLite/mémoire et migration transactionnelle |
| Stockfish embarqué | Adversaire et analyse hors ligne | Stockfish 17.1, module Expo local Kotlin/JNI C++ ARM64 et NNUE embarqués |
| `chess.js` | Règles et validation des coups | Installé ; règles et validation des coups derrière adaptateur |
| `react-native-svg` | Pièces et icônes vectorielles locales | Compatible Expo SDK 57 ; assets Chessnut Apache-2.0, icônes géométriques originales |
| Jest + `jest-expo` | Tests unitaires et intégration, rapides et déterministes | Configuré ; preset jest-expo et tests front sans effets externes |

Le runner est concrétisé par Jest et le preset `jest-expo`, documentés dans
[le guide officiel Expo](https://docs.expo.dev/develop/unit-testing/). La suite
actuelle teste les services business et front avec des dépendances injectées,
le raccordement React et les migrations/persistance avec le vrai SQLite Node
dans des bases temporaires. Ce dernier contrôle substitue seulement la frontière
Expo ; il ne remplace pas la preuve SQLite native sur APK.

Les adaptateurs en mémoire servent aux tests ; l’application utilise SQLite.

## Outils de développement et de distribution

- Skills Matt Pocock et Impeccable : installés localement dans `.agents/skills`.
- Skill CU-ARCHI : installé dans `/Users/zeke/.agents/skills/cu-archi`.
- Prettier : version exacte installée pour les sources ; contrôle architectural
  TypeScript complémentaire dans `npm run check:architecture`. Le complément
  local `scripts/format-function-blocks.mjs` utilise l'AST TypeScript et Prettier
  pour conserver l'espacement des fonctions d'objet demandé pour Chess69.
- Storybook avec le framework officiel React Native Web/Vite : catalogue de
  composants isolé dans `.storybook`, sans changement de l’entrée Expo ni
  ajout de dépendance native. Les preuves de stories web et d’APK Android
  sont distinctes. Playwright contrôle le rendu des stories statiques.
- Compilation Android locale : outils Android SDK, JDK et Gradle compatibles
  avec Expo SDK 57 ; OpenJDK 17, SDK 36, NDK 27.1.12297006, Gradle 9.3.1.
  Setup et signature : [procédure Android](android-release.md).
- APK release signée : distribution depuis Mustang, via Caddy et les
  procédures du projet `vps-perso`, sur `https://apk.rentabe.ovh/chess69`.

Le VPS héberge les téléchargements. L’application installée conserve ses données
et ses calculs sur le téléphone. Il n’y a ni API métier distante ni synchronisation
requise pour jouer et apprendre.

## État actuel et maintenance

Expo SDK 57 est installé avec React 19.2.3, React Native 0.86.3 et
TypeScript 6 strict. Le projet Android est versionné et maintenu explicitement.
SQLite, Stockfish et chess.js sont intégrés. Le ticket de preuve native
consigne les contrôles sur une APK signée réellement exécutée sur Android
API 36 ARM64 ; les performances et les transferts Samsung restent à vérifier
sur le Galaxy S22 Ultra.

Les versions exactes sont celles de `package.json` et du
lockfile. Mettre à jour ici les choix et statuts quand ils changent ; consulter
CU-ARCHI pour les conventions structurelles et de codage.

Stockfish est compilé depuis les sources et les réseaux exacts conservés dans
`android/vendor/stockfish`, avec vérification SHA-256 des NNUE au build. Le
module Expo local de `modules/chess69-stockfish` lance ses calculs hors du fil
JavaScript et les annule explicitement. La distribution inclut les sources
correspondants sous GPLv3 ; voir [THIRD_PARTY.md](../THIRD_PARTY.md).
