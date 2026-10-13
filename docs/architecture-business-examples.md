# Exemples d’architecture business

Ces exemples complètent les [conventions d’architecture](architecture.md).
Les blocs TypeScript indiquent chacun leur fichier cible. Ils décrivent une
miniature cohérente : vérifier une réponse de puzzle avec un repository injecté.
La comparaison porte sur un seul coup déjà normalisé ; un vrai puzzle devra
gérer les règles d’échecs et une séquence de coups.

L’organisation des dossiers est présentée dans
[l’arborescence globale](architecture-arborescence-exemple.md).

## 1. Module : contrats et dépendances

`src/services-business/puzzle/puzzle-type.ts` :

```ts
import type { RepositoryService } from '../adapter/repository/repository-type';
import type { ClockService } from '../adapter/clock/clock-type';

export type PuzzleAnswer =
  | Readonly<{ status: 'not-found' }>
  | Readonly<{
      status: 'checked';
      correct: boolean;
      answeredAt: number;
    }>;

export interface PuzzleService {
  checkAnswer: (puzzleId: string, move: string) => Promise<PuzzleAnswer>;
}

export type PuzzleServiceDependencies = Readonly<{
  repositoryService: RepositoryService;
  clockService: ClockService;
}>;
```

Le puzzle définit seulement ses modèles, son interface et ses dépendances.
Les contrats de repository et d’horloge appartiennent à leurs adaptateurs.

## 2. Module : fabrique et règle pure dans le service

`src/services-business/puzzle/puzzle-service.ts` :

```ts
import type {
  PuzzleService,
  PuzzleServiceDependencies,
} from './puzzle-type';
import type { PuzzleRecord } from '../adapter/repository/repository-type';

export const createPuzzleService = (
  { repositoryService, clockService }: PuzzleServiceDependencies,
): PuzzleService => ({
  checkAnswer: async (puzzleId, move) => {
    const puzzle = await repositoryService.findPuzzleById(puzzleId);

    if (!puzzle) {
      return { status: 'not-found' };
    }

    return {
      status: 'checked',
      correct: isCorrectMove(puzzle, move),
      answeredAt: clockService.now(),
    };
  },
});

// Le consommateur est au-dessus de ce helper privé et pur.
const isCorrectMove = (puzzle: PuzzleRecord, move: string): boolean =>
  puzzle.solutionMove === move;
```

La fabrique retourne l’interface `PuzzleService`. Elle reçoit ses dépendances,
sans importer SQLite ni construire un repository. La règle pure reste privée ;
le test l’exerce par le comportement public du service.

## 3. Adaptateurs : repository et horloge

`src/services-business/adapter/repository/repository-type.ts` :

```ts
import { z } from 'zod';

export const puzzleRecordSchema = z.object({
  id: z.string().min(1),
  solutionMove: z.string().min(1),
});

export type PuzzleRecord = Readonly<z.infer<typeof puzzleRecordSchema>>;

export interface RepositoryService {
  findPuzzleById: (id: string) => Promise<PuzzleRecord | undefined>;
}

export type RepositoryMemoryDependencies = Readonly<{
  puzzles: ReadonlyArray<PuzzleRecord>;
}>;
```

`src/services-business/adapter/repository/repository-service/index.ts` :

```ts
export { createRepositoryMemoryService } from './repository-memory-service';
export { createRepositorySqliteService } from './repository-sqlite-service';
```

`src/services-business/adapter/repository/repository-service/repository-memory-service.ts` :

```ts
import type {
  RepositoryMemoryDependencies,
  RepositoryService,
} from '../repository-type';

export const createRepositoryMemoryService = (
  { puzzles }: RepositoryMemoryDependencies,
): RepositoryService => {
  const puzzlesById = new Map(puzzles.map((puzzle) => [puzzle.id, puzzle]));

  return { findPuzzleById: async (id) => puzzlesById.get(id) };
};
```

`src/services-business/adapter/repository/repository-service/repository-sqlite-service.ts` :

```ts
import type { SQLiteDatabase } from 'expo-sqlite';
import type { RepositoryService } from '../repository-type';

// La dépendance SDK appartient à cette implémentation uniquement.
type RepositorySqliteDependencies = Readonly<{ database: SQLiteDatabase }>;
type PuzzleRow = Readonly<{ id: string; solution_move: string }>;

export const createRepositorySqliteService = (
  { database }: RepositorySqliteDependencies,
): RepositoryService => ({
  findPuzzleById: async (id) => {
    const row = await database.getFirstAsync<PuzzleRow>(
      'SELECT id, solution_move FROM puzzles WHERE id = ?',
      id,
    );

    if (!row) return undefined;

    return { id: row.id, solutionMove: row.solution_move };
  },
});
```

La base est ouverte et son schéma préparé explicitement au démarrage. Cette
fabrique n’ouvre pas la base à l’import. L’exemple utilise la méthode
[`getFirstAsync` d’Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

`src/services-business/adapter/clock/clock-type.ts` :

```ts
export interface ClockService {
  now: () => number;
}

export type ClockNativeDependencies = Readonly<{ now: () => number }>;
```

`src/services-business/adapter/clock/clock-service/index.ts` :

```ts
export { createClockNativeService } from './clock-native-service';
```

`src/services-business/adapter/clock/clock-service/clock-native-service.ts` :

```ts
import type { ClockNativeDependencies, ClockService } from '../clock-type';

export const createClockNativeService = (
  { now }: ClockNativeDependencies,
): ClockService => ({ now });
```

L’application fournit `Date.now`, les tests une fonction fixe. Une autre
implémentation, comme `clock-dayjs-service.ts`, appartient à ce même dossier
et retourne le même `ClockService`. Créer les variantes seulement au besoin.

## 4. DI : un seul fichier, services exposés et adaptateurs internes

`src/services-business/dependency-injection.ts` :

```ts
import { createClockNativeService } from './adapter/clock/clock-service';
import { createRepositoryMemoryService } from './adapter/repository/repository-service';
import type { PuzzleRecord } from './adapter/repository/repository-type';
import { createPuzzleService } from './puzzle/puzzle-service';
import type { PuzzleService } from './puzzle/puzzle-type';

export type ServicesBusiness = Readonly<{
  puzzleService: PuzzleService;
}>;

type ServicesBusinessDependencies = Readonly<{
  puzzles: ReadonlyArray<PuzzleRecord>;
  now: () => number;
}>;

export const createServicesBusiness = (
  { puzzles, now }: ServicesBusinessDependencies,
): ServicesBusiness => {
  const repositoryService = createRepositoryMemoryService({ puzzles });
  const clockService = createClockNativeService({ now });
  const puzzleService = createPuzzleService({ repositoryService, clockService });

  return { puzzleService };
};
```

Le point d’entrée de la démonstration appelle `createServicesBusiness({ puzzles,
now: Date.now })` une fois, puis fournit le résultat au contexte React.
L’interface exposée contient seulement `puzzleService` ; le repository et
l’horloge restent internes à l’assemblage.

Le stockage réel remplacera `createRepositoryMemoryService` par l’adaptateur SQLite dans
ce fichier, avec ses paramètres et son initialisation explicite. Le contrat du
puzzle et les appelants du service restent identiques.

## 5. Service profond : passer d’un fichier à un dossier

Si l’implémentation grossit, remplacer le fichier par le dossier décrit
dans [la variante de service profond](architecture-arborescence-exemple.md#variante-service-profond).

`src/services-business/puzzle/puzzle-service/index.ts` :

```ts
export { createPuzzleService } from './create-puzzle-service';
```

`src/services-business/puzzle/puzzle-service/puzzle-validation.ts` :

```ts
import type { PuzzleRecord } from '../../adapter/repository/repository-type';

export const isCorrectMove = (puzzle: PuzzleRecord, move: string): boolean =>
  puzzle.solutionMove === move;
```

Déplacer la fabrique du module simple dans `create-puzzle-service.ts`, importer
ses types métier depuis `../puzzle-type`, `PuzzleRecord` depuis
`../../adapter/repository/repository-type` et sa règle depuis `./puzzle-validation`.
La DI conserve son import depuis `./puzzle/puzzle-service`. Les appelants
n’importent pas directement `puzzle-validation.ts`.

## 6. Test unitaire : dépendances injectées

Exemples écrits avec les fonctions `describe`, `it` et `expect` d’un runner
de tests. Le runner sera configuré lors de l’initialisation du projet.

`tests/services-business/puzzle-service.test.ts` :

```ts
import { createPuzzleService } from '../../src/services-business/puzzle/puzzle-service';
import type { RepositoryService } from '../../src/services-business/adapter/repository/repository-type';

describe('puzzle service', () => {
  it('verifies a correct answer with a fixed clock', async () => {
    const repositoryService: RepositoryService = {
      findPuzzleById: async (id) =>
        id === 'p1' ? { id, solutionMove: 'e2e4' } : undefined,
    };
    const service = createPuzzleService({
      repositoryService,
      clockService: { now: () => 1_000 },
    });

    expect(await service.checkAnswer('p1', 'e2e4')).toEqual({
      status: 'checked',
      correct: true,
      answeredAt: 1_000,
    });
  });

  it('reports a missing puzzle', async () => {
    const service = createPuzzleService({
      repositoryService: { findPuzzleById: async () => undefined },
      clockService: { now: () => 1_000 },
    });

    expect(await service.checkAnswer('missing', 'e2e4')).toEqual({
      status: 'not-found',
    });
  });
});
```

## 7. Test d’intégration : assemblage en mémoire

`tests/services-business/dependency-injection.test.ts` :

```ts
import { createServicesBusiness } from '../../src/services-business/dependency-injection';

describe('business services assembly', () => {
  it('combines the real service with memory and clock adapters', async () => {
    const servicesBusiness = createServicesBusiness({
      puzzles: [{ id: 'p1', solutionMove: 'e2e4' }],
      now: () => 2_000,
    });

    expect(await servicesBusiness.puzzleService.checkAnswer('p1', 'd2d4')).toEqual({
      status: 'checked',
      correct: false,
      answeredAt: 2_000,
    });
  });
});
```

Ce test assemble les vrais modules via la DI. Il reste rapide et déterministe,
sans disque, réseau, SQLite natif, appareil ou état partagé entre tests.

## 8. Front et interface

Voir les [exemples de services front, réactivité, navigation et UI](architecture-front-examples.md).

## 9. Validation d’une donnée externe avec Zod

Dans une fonction du service repository recevant une donnée inconnue :

```ts
import { puzzleRecordSchema } from '../repository-type';

const result = puzzleRecordSchema.safeParse(unknownData);

if (!result.success) {
  return { status: 'invalid-data' } as const;
}

return { status: 'valid', puzzle: result.data } as const;
```

Ce fragment illustre le traitement au point d’entrée, pas une nouvelle opération
du contrat `RepositoryService`. Le schéma et le type ont une seule définition,
avec les mécanismes de [validation et d’inférence Zod](https://zod.dev/basics).
La chaîne `solutionMove` est ici seulement non vide ; la légalité du coup reste
une règle métier.
