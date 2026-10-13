# Technologies de Chess69

Ce document est la référence des choix technologiques. L’organisation du code
est décrite dans [architecture.md](architecture.md), avec des exemples
[business](architecture-business-examples.md) et [front](architecture-front-examples.md).
La structure complète est dans [l’arborescence globale](architecture-arborescence-exemple.md).

## Technologies retenues

| Technologie | Usage | Statut |
| --- | --- | --- |
| React Native | Application mobile Android et composants natifs | Installé ; première APK 0.1.0 |
| React | Composition de l’interface et réactivité | Installé avec React Native |
| Expo | Outillage et modules Android, compilation d’une APK autonome | Installé ; première APK 0.1.0 |
| TypeScript en mode strict | Contrats, types et vérification statique | Configuré en mode strict |
| Zod | Validation des données à l’exécution et types inférés depuis les schémas | Installé ; validation future aux entrées de données |
| Remeda | Transformations fonctionnelles et utilitaires purs | Installé ; disponible pour les transformations utiles |
| Git | Historique du projet | Initialisé, branche `main` |
| GitHub | Dépôt distant | `zeke1806/chess69`, remote `origin` configuré |

La DI est écrite manuellement avec des fonctions ; aucune bibliothèque de
conteneur n’est retenue. Les services front encapsulent leur état et sont
raccordés à React par un adaptateur. L’exemple utilise `useSyncExternalStore` ;
aucune bibliothèque supplémentaire de gestion d’état n’est retenue.

## Briques confirmées

| Technologie | Usage | Statut |
| --- | --- | --- |
| Expo Router | Routes raccordées aux features | Installé ; routes dans src/app |
| SQLite via `expo-sqlite` | Persistance locale derrière `RepositoryService` | Validé ; intégration à faire |
| Stockfish embarqué | Adversaire et analyse hors ligne | Validé ; intégration native à prototyper |
| `chess.js` | Règles et validation des coups | Validé ; intégration à faire |
| Jest + `jest-expo` | Tests unitaires et intégration en mémoire, rapides et déterministes | Configuré ; preset jest-expo et tests front sans effets externes |

Le runner est concrétisé par Jest et le preset `jest-expo`, documentés dans
[le guide officiel Expo](https://docs.expo.dev/develop/unit-testing/). Les tests
business et front restent sans effets externes ; les tests UI sont séparés.

Les repositories en mémoire des exemples servent à démontrer et tester les
contrats. Ils ne remplacent pas la persistance de l’application finale.

## Outils de développement et de distribution

- Skills Matt Pocock et Impeccable : installés localement dans `.agents/skills`.
- Compilation Android locale : outils Android SDK, JDK et Gradle compatibles
  avec Expo SDK 57 ; OpenJDK 17, SDK 36, NDK 27.1.12297006, Gradle 9.3.1.
  Setup et signature : [procédure Android](android-release.md).
- APK release signée : distribution depuis Mustang, via Caddy et les
  procédures du projet `vps-perso`, sur `https://apk.rentabe.ovh/chess69`.

Le VPS héberge les téléchargements. L’application installée conserve ses données
et ses calculs sur le téléphone. Il n’y a ni API métier distante ni synchronisation
requise pour jouer et apprendre.

## État actuel et maintenance

Le scaffold Expo SDK 57 est installé avec React 19.2.3, React Native 0.86.3 et
TypeScript 6 strict. Le premier écran utilise un service front et ses bindings
React ; aucun service métier ni stockage fictif n’a été ajouté. Le projet
Android est versionné et maintenu explicitement. SQLite, Stockfish et chess.js
restent à intégrer ; ce jalon ne les valide pas.

Les versions exactes sont celles de `package.json` et du
lockfile. Mettre à jour ici les choix et statuts quand ils changent ; conserver
les conventions structurelles et de codage dans `architecture.md`.
