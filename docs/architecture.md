# Architecture de Chess69

## Portée et décisions

Ce document est la référence d’architecture pour les agents IA et les développeurs.
Il décrit l’organisation appliquée aux parcours locaux : métier, services front,
présentation et adaptateurs natifs. Les modules grandissent avec leurs besoins réels.

- Une seule application mobile, sans API serveur. Les choix de technologies
  et leur statut sont définis dans [architecture-techno.md](architecture-techno.md).
- Métier dans `src/services-business`, logique d’interface dans `src/services-front`,
  affichage et câblage dans `src/ui/components` et `src/ui/features`.
- Contrats et logique métier indépendants des implémentations externes : principes
  de Clean Architecture et d’Onion Architecture appliqués aux dépendances, sans
  imposer de dossiers par couche ni de dossier `core`.
- Programmation fonctionnelle, fabriques de services et injection manuelle.
- Fonctionnement local ; le VPS sert uniquement au téléchargement des APK.

## Organisation des modules

Dans `services-business` et `services-front`, chaque dossier de module contient exactement deux entrées :

1. `<module>-type.ts` : modèles, contrats, interface du service et types de dépendances.
2. `<module>-service.ts`, ou `<module>-service/` : implémentation et fabrique du service.

Chaque bloc contient ses modules, son regroupement `adapter` et un seul fichier
`dependency-injection.ts`. Ces deux fichiers assemblent respectivement le métier
et le front ; ils ne sont pas des dossiers de module. Un adaptateur ayant plusieurs
implémentations utilise un dossier `<module>-service/`, qui les nomme explicitement.

### Type et service

- `<module>-type.ts` est la source unique des contrats du module. Les contrats de
  stockage appartiennent à `adapter/repository/repository-type.ts` ; les contrats
  d’horloge à `adapter/clock/clock-type.ts`. Les types métier restent dans leur module.
- `<module>-service.ts` contient les fonctions pures, règles, constantes privées
  et cas d’usage du module, ainsi que sa fabrique `createPuzzleService`.
- Les règles du puzzle appartiennent à `puzzle-service.ts`, ou à des fichiers
  internes de `puzzle-service/` lorsque l’implémentation grossit.
- Lorsqu’il devient un dossier, `<module>-service/index.ts` expose une interface
  simple et masque les fichiers internes. Garder soit le fichier, soit le dossier.
- Le module n’a pas d’`index.ts` supplémentaire à sa racine. Les contrats sont
  importés depuis `<module>-type`, la fabrique depuis `<module>-service`.
- Entre modules, les appelants utilisent ces deux points d’entrée et ne traversent
  pas les fichiers internes d’une implémentation profonde.
- Les helpers et constantes réutilisables sont exposés depuis le service si un
  besoin concret le justifie ; les valeurs privées restent dans son implémentation.

Un module profond regroupe un comportement utile derrière peu d’opérations.
Son interface précise les résultats, invariants et erreurs ; elle masque les
requêtes SQL, protocoles externes et étapes internes. Extraire un autre module
lorsqu’une responsabilité identifiable ou une réutilisation concrète le justifie.

## Contrats et direction des dépendances

Les modules métier importent les contrats abstraits des adaptateurs avec
`import type`. L’emplacement `adapter` ne rend pas un contrat concret : ses types
restent indépendants de SQLite, React et des autres SDK.

- `services-business/adapter/repository/repository-type.ts` regroupe les interfaces de
  repository et les types de données persistées. Le module puzzle n’y redéfinit
  aucun repository. Privilégier des opérations typées utiles au domaine plutôt
  qu’une interface CRUD générique qui expose le stockage.
- Le module `repository` regroupe les implémentations dans `repository-service/`,
  par exemple `repository-sqlite-service.ts` et `repository-memory-service.ts`.
  Le nom indique la technologie utilisée, et `index.ts` expose leurs fabriques.
- Même principe pour `clock` : `clock-native-service.ts`, `clock-moment-service.ts`
  ou `clock-dayjs-service.ts`, selon les implémentations réellement nécessaires.
- Les dépendances propres à un SDK restent dans l’implémentation correspondante.
  Les résultats sont convertis en types du contrat ; aucun type SQL ne fuit au métier.
- Les services métier reçoivent leurs dépendances par paramètres. Ils ne construisent
  pas les adaptateurs et n’importent pas leurs implémentations.
- Un service peut recevoir le contrat d’un autre service. La DI fournit l’implémentation.
- Les contrats partagés doivent éviter les cycles d’import ; ne créer ni registre
  global ni imports circulaires entre implémentations.

L’inversion de dépendance reste intacte : l’implémentation concrète satisfait le
contrat du projet ; le domaine dépend du contrat, jamais de la bibliothèque.

## Typage et validation des données

Utiliser Zod pour valider les données à l’exécution et inférer leurs types
TypeScript depuis les schémas. TypeScript décrit les contrats statiques ; il ne
valide pas les fichiers importés, sauvegardes, paramètres de routes ou données
lues depuis le stockage.

- Placer le schéma dans le fichier `<module>-type.ts` qui possède le contrat,
  puis dériver le type avec `z.infer` au lieu de le déclarer une seconde fois.
  Les schémas sont des valeurs pures exportables ; ces fichiers peuvent donc
  contenir ces valeurs en plus des déclarations de types.
- Les schémas de données persistées vivent dans
  `services-business/adapter/repository/repository-type.ts`.
- Valider les données inconnues à leur entrée dans l’application ou à la sortie
  des adaptateurs, avant de les transmettre comme données fiables aux services.
- Préférer `safeParse` lorsqu’une erreur de validation est un résultat attendu,
  puis traiter l’échec avec un early return. Utiliser `parse` lorsque le contrat
  prévoit explicitement une erreur ; ne pas remplacer la validation par un cast.
- Convertir les erreurs de validation en résultats applicatifs utiles ; le service
  front décide des messages affichés. Les composants ne lisent pas les internals Zod.
- Garder les règles métier dans les services. Un schéma vérifie la structure et
  les contraintes de données ; il ne remplace pas les règles légales d’un coup
  d’échecs ni les cas d’usage. Éviter de revalider chaque appel interne déjà typé.

## Métier, services front et présentation

| Bloc | Responsabilité | Ce qu’il reçoit |
| --- | --- | --- |
| `services-business` | Règles et cas d’usage métier, stockage par contrats | Dépendances métier et adaptateurs injectés |
| `services-front` | État d’écran, actions, chargement, erreurs et orchestration de l’interface | Services métier et contrats d’infrastructure |
| `services-front/adapter/react` | Bindings et abonnement au système de réactivité React | Services front avec snapshot et abonnement |
| `services-front/adapter/navigation` | Adaptation du routeur, implémentation nommée selon l’infrastructure | Fonctions ou instance du routeur fournies au démarrage |
| `ui/components` | Affichage quasi stateless et logique de présentation locale | Props et callbacks |
| `ui/features` | Câblage des services front, bindings et composants d’affichage | Services front exposés par la DI |
| Routes Expo | Entrées de navigation et raccordement des features | Features et contexte applicatif |

Les composants d’affichage n’accèdent pas aux services, repositories ou routeurs.
Un état purement visuel, comme ouvrir un panneau, peut rester local. La feature
assemble les composants et branche les actions ; les décisions d’état réutilisables
appartiennent aux services front. Le choix des messages de chargement, d’erreur
ou de résultat appartient au service front du domaine : il expose ces messages
dans son snapshot. La feature les transmet, le composant les affiche. Le formatage
visuel local peut rester dans le composant ; les messages d’interface ne sont
pas ajoutés au service business.

Un service front est une fabrique fonctionnelle stateful, indépendante de React.
Il expose un snapshot immuable, un abonnement avec désabonnement et des actions.
Le snapshot garde sa référence tant que l’état ne change pas. Les actions définissent
leurs états de chargement et d’erreur, ainsi que le traitement des appels concurrents.

L’adaptateur React consomme ces contrats et expose des hooks utilisables par les
features. Les hooks sont appelés conformément aux règles React. La navigation
passe par un contrat injecté ; les services front n’importent pas le routeur Expo.

Le flux est : route → feature → binding/service front → service métier → repository.
L’affichage reçoit ses valeurs de la feature. Même sans API réseau, `services-business`
reste distinct de `services-front` ; une API n’est pas créée pour simuler cette séparation.

## Injection de dépendance dans un seul fichier

`src/services-business/dependency-injection.ts` exporte la fonction `createServicesBusiness`, qui
assemble les adaptateurs et les services et retourne un objet typé selon les
besoins des appelants. Les types propres à cet assemblage sont déclarés dans ce
même fichier ; aucun dossier DI ni fichier de typage DI séparé n’est nécessaire.
`src/services-front/dependency-injection.ts` exporte de même `createServicesFront`,
qui reçoit les services métier et les bindings d’infrastructure nécessaires. Il
construit les services front et les adaptateurs de réactivité/navigation. Les routes
ou le contexte fournissent uniquement cet assemblage front aux features.

- Construire les dépendances internes, puis les injecter dans les fabriques métier.
- Exposer normalement les services métier, par exemple `{ puzzleService,
  openingService }`. Un autre élément est exposé seulement si l’appelant en a besoin.
- Garder les repositories, connexions SQLite et autres adaptateurs internes.
- Chaque fabrique reçoit seulement les dépendances qu’elle utilise, pas tout
  l’objet retourné par `createServicesBusiness`.
- Remplacer une bibliothèque en changeant l’adaptateur construit dans ce fichier,
  tout en conservant le contrat utilisé par le service métier.
- Créer un assemblage par instance d’application, puis le fournir au contexte
  React depuis le point d’entrée Expo. Chaque test crée son assemblage isolé.
- Les imports sont sans effets. L’initialisation et la libération des ressources
  natives sont explicites au démarrage et à l’arrêt. Une fonction de cycle de vie
  peut être exposée si nécessaire, sans exposer la connexion elle-même.

La DI est un point de composition fonctionnel, sans registre global, décorateur,
réflexion ni bibliothèque de conteneur.

## Style fonctionnel et nommage

- Les fabriques `createXService` reçoivent un objet de dépendances typé et retournent
  un objet conforme à l’interface du service, avec un type de retour explicite.
- Utiliser des fonctions plutôt que des classes. Une exception ciblée, comme
  l’extension d’`Error`, doit répondre à un besoin technique concret.
- Les fonctions pures calculent sans modifier leurs entrées. Utiliser `Readonly`
  et `ReadonlyArray` aux interfaces ; composer les transformations avec Remeda
  lorsque cela facilite leur lecture.
- Les effets sont exécutés par les adaptateurs. Le service qui les orchestre
  n’est pas présenté comme une fonction pure.
- Injecter les sources non déterministes nécessaires : heure, identifiants et hasard.
  Les règles métier ne lisent pas directement `Date.now()` ou `Math.random()`.
- Un état mutable local peut être encapsulé dans un service front, un adaptateur
  ou un double de test ; il ne devient pas un état global partagé. Les snapshots
  exposés aux appelants restent immuables.
- Fichiers et dossiers du projet : kebab-case minuscule. Fonctions et variables :
  camelCase. Types et interfaces : PascalCase.
- Placer les fonctions consommatrices avant les fonctions qu’elles appellent :
  fabrique et opérations publiques d’abord, helpers privés ensuite. Avec des
  fonctions fléchées, différer l’appel jusqu’à l’initialisation des helpers ; utiliser
  une déclaration de fonction si un appel antérieur doit être hoisté.
- Utiliser des early returns pour les absences, erreurs et conditions de garde ;
  garder le chemin principal lisible avec peu d’imbrication.
- Conserver les noms imposés par les outils : `AGENTS.md`, `SKILL.md`, `index.ts`
  et conventions Expo comme `_layout.tsx`.

## Tests rapides sans effets externes

Les tests unitaires vérifient les comportements d’un module à travers son
interface. Les tests d’intégration assemblent plusieurs vrais modules en
processus, avec des adaptateurs en mémoire pour les effets.

- Placer les tests dans `tests/services-business/`, `tests/services-front/` et `tests/ui/`
  selon le bloc testé, en `<nom>.test.ts` ou `<nom>.test.tsx`,
  pour conserver uniquement le type et le service à la racine de chaque module.
- Aucun accès réel au réseau, au disque, à SQLite natif ou à Stockfish dans cette
  suite ; aucun serveur, conteneur, émulateur ou appareil requis.
- Injecter une horloge fixe, un hasard contrôlé et des identifiants déterministes
  selon les besoins. Aucun délai réel pour attendre une révision.
- Recréer les doubles et leur état par test. Une mutation en mémoire dans un
  double est permise ; aucun effet externe ni état partagé entre tests.
- Vérifier des résultats observables, les cas limites et erreurs des contrats.
  Les tests restent valables après un refactoring des fonctions privées.
- Tester les combinaisons utiles sans répéter les mêmes scénarios à chaque couche.
  Configurer le runner retenu dans `architecture-techno.md` lors de
  l’initialisation de l’application.

Cette suite valide le comportement avec les doubles. Les adaptateurs natifs
réels et l’installation de l’APK nécessitent des validations ciblées sur appareil.

## Application des conventions

Avant d’implémenter, identifier le module, ses contrats et ses dépendances injectées.
Créer uniquement son fichier de type et son service ; approfondir l’implémentation
à l’intérieur du dossier service si nécessaire. Assembler les dépendances dans
`dependency-injection.ts` et exposer seulement ce dont l’application a besoin.

Avant de terminer, vérifier la forme des modules, les imports par leurs interfaces,
l’absence de dépendance concrète dans la logique métier et les tests de comportement
pertinents. Ce document reste la source de vérité de l’architecture.

## Exemples de référence

Pour placer les fichiers ou consulter la structure globale, lire
[l’arborescence de référence](architecture-arborescence-exemple.md).
Pour implémenter un module métier, lire les
[exemples business](architecture-business-examples.md). Ils illustrent
les contrats, une fabrique fonctionnelle, les adaptateurs, le fichier DI unique,
l’approfondissement d’un service et les tests dans un dossier séparé.
Pour les services stateful, la réactivité React, la navigation et le câblage UI,
lire les [exemples front](architecture-front-examples.md).

Ces exemples sont pédagogiques ; ils ne constituent pas une implémentation
complète des puzzles ni du stockage de l’application.
