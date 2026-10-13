# Exemple d’arborescence globale

Ce fichier regroupe la structure business, front, UI, routes et tests du projet.
Il complète les [conventions](architecture.md), les [technologies](architecture-techno.md)
et les exemples de code [business](architecture-business-examples.md) et
[front](architecture-front-examples.md).

L’arborescence applicative est une cible illustrative, pas l’état actuel du disque.
Créer les modules et tests selon les besoins ; les dossiers `src` et `tests`
seront initialisés avec l’application.

## Structure globale

```text
chess69/
  AGENTS.md
  .gitignore
  .agents/
    skills/
  docs/
    architecture.md
    architecture-techno.md
    architecture-arborescence-exemple.md
    architecture-business-examples.md
    architecture-front-examples.md
    mode-de-travail.md
    agents/
      issue-tracker.md
      triage-labels.md
      domain.md
  src/
    services-business/
      dependency-injection.ts
      puzzle/
        puzzle-type.ts
        puzzle-service.ts
      adapter/
        repository/
          repository-type.ts
          repository-service/
            index.ts
            repository-memory-service.ts
            repository-sqlite-service.ts
        clock/
          clock-type.ts
          clock-service/
            index.ts
            clock-native-service.ts
    services-front/
      dependency-injection.ts
      puzzle/
        puzzle-type.ts
        puzzle-service.ts
      adapter/
        react/
          react-type.ts
          react-service.ts
        navigation/
          navigation-type.ts
          navigation-service/
            index.ts
            navigation-expo-router-service.ts
    ui/
      components/
        puzzle-answer.tsx
      features/
        puzzle-feature.tsx
    app/
      _layout.tsx
      puzzles.tsx
  tests/
    services-business/
      puzzle-service.test.ts
      dependency-injection.test.ts
    services-front/
      puzzle-service.test.ts
      dependency-injection.test.ts
    ui/
      puzzle-answer.test.tsx
      puzzle-feature.test.tsx
```

Les fichiers de configuration Expo, TypeScript et Jest, le manifeste des
dépendances et le lockfile seront ajoutés au scaffold selon les outils retenus.

## Lecture des blocs

| Dossier | Contenu |
| --- | --- |
| `services-business` | Modules métier et adaptateurs de repository, horloge et autres capacités |
| `services-front` | Modules d’état et d’actions d’interface, adaptateurs React et navigation |
| `ui/components` | Affichage par props et callbacks |
| `ui/features` | Câblage des services front et des composants |
| `app` | Routes Expo et raccordement de la présentation |
| `tests` | Tests séparés, répartis selon les blocs concernés |

Chaque bloc de services possède son fichier DI unique. Chaque module contient
son fichier de type et son service, sous forme de fichier ou de dossier.
Les règles de dépendance et de codage restent définies dans `architecture.md`.

## Variante : service profond

Quand le module puzzle grossit, remplacer son fichier `puzzle-service.ts`
par cette structure, dans le bloc business ou front concerné :

```text
puzzle/
  puzzle-type.ts
  puzzle-service/
    index.ts
    create-puzzle-service.ts
    puzzle-validation.ts
```

Les noms internes dépendent du comportement du module. L’`index.ts` du dossier
service expose sa fabrique ; aucun `index.ts` supplémentaire n’est ajouté à la
racine du module. Les [exemples business](architecture-business-examples.md)
montrent le code de cette variante.
