# Technologies de Chess69

Ce document est la référence des choix technologiques. L’organisation du code
est décrite dans [architecture.md](architecture.md), avec des exemples
[business](architecture-business-examples.md) et [front](architecture-front-examples.md).
La structure complète est dans [l’arborescence globale](architecture-arborescence-exemple.md).

## Technologies retenues

| Technologie | Usage | Statut |
| --- | --- | --- |
| React Native | Application mobile Android et composants natifs | Validé ; application à initialiser |
| React | Composition de l’interface et réactivité | Inclus dans la stack React Native ; à installer avec le scaffold |
| Expo | Outillage et modules Android, compilation d’une APK autonome | Validé ; application à initialiser |
| TypeScript en mode strict | Contrats, types et vérification statique | Validé ; configuration à créer |
| Zod | Validation des données à l’exécution et types inférés depuis les schémas | Validé ; installation avec l’application |
| Remeda | Transformations fonctionnelles et utilitaires purs | Demandé ; installation à faire avec l’application |
| Git | Historique du projet | Initialisé, branche `main` |
| GitHub | Dépôt distant | `zeke1806/chess69`, remote `origin` configuré |

La DI est écrite manuellement avec des fonctions ; aucune bibliothèque de
conteneur n’est retenue. Les services front encapsulent leur état et sont
raccordés à React par un adaptateur. L’exemple utilise `useSyncExternalStore` ;
aucune bibliothèque supplémentaire de gestion d’état n’est retenue.

## Briques confirmées

| Technologie | Usage | Statut |
| --- | --- | --- |
| Expo Router | Routes raccordées aux features | Validé ; configuration au scaffold |
| SQLite via `expo-sqlite` | Persistance locale derrière `RepositoryService` | Validé ; intégration à faire |
| Stockfish embarqué | Adversaire et analyse hors ligne | Validé ; intégration native à prototyper |
| `chess.js` | Règles et validation des coups | Validé ; intégration à faire |
| Jest + `jest-expo` | Tests unitaires et intégration en mémoire, rapides et déterministes | Choix pour concrétiser le runner ; configuration au scaffold |

Le runner est concrétisé par Jest et le preset `jest-expo`, documentés dans
[le guide officiel Expo](https://docs.expo.dev/develop/unit-testing/). Les tests
business et front restent sans effets externes ; les tests UI sont séparés.

Les repositories en mémoire des exemples servent à démontrer et tester les
contrats. Ils ne remplacent pas la persistance de l’application finale.

## Outils de développement et de distribution

- Skills Matt Pocock et Impeccable : installés localement dans `.agents/skills`.
- Compilation Android locale : outils Android SDK, JDK et Gradle compatibles
  avec la version Expo retenue ; environnement à vérifier lors du scaffold.
- APK release signée : distribution prévue depuis Mustang, via Caddy et les
  procédures du projet `vps-perso`, sur `apk.rentabe.ovh/chess-69/`.

Le VPS héberge les téléchargements. L’application installée conserve ses données
et ses calculs sur le téléphone. Il n’y a ni API métier distante ni synchronisation
requise pour jouer et apprendre.

## État actuel et maintenance

Le dépôt contient les skills et la documentation. Aucun scaffold mobile ni
`package.json` applicatif n’a encore été créé : les technologies validées ne sont
donc pas présentées comme des dépendances déjà installées.

Après l’initialisation, les versions exactes sont celles de `package.json` et du
lockfile. Mettre à jour ici les choix et statuts quand ils changent ; conserver
les conventions structurelles et de codage dans `architecture.md`.
