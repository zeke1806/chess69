# Exemples front et interface

Ces exemples complètent les [conventions](architecture.md) et les
[exemples métier](architecture-business-examples.md). Ils réutilisent `PuzzleService`,
sans repository ni connexion SQL dans le front. Les fichiers présentés sont
des exemples documentaires, pas des fichiers applicatifs déjà créés.

L’organisation des dossiers est présentée dans
[l’arborescence globale](architecture-arborescence-exemple.md).

## 1. Service front : état et actions indépendants de React

`src/services-front/puzzle/puzzle-type.ts` :

```ts
import type { PuzzleAnswer, PuzzleService } from '../../services-business/puzzle/puzzle-type';
import type { NavigationService } from '../adapter/navigation/navigation-type';

export type PuzzleFrontState = Readonly<{
  status: 'idle' | 'loading' | 'ready' | 'error';
  answer: PuzzleAnswer | null;
}>;

export type PuzzleFrontSnapshot = PuzzleFrontState & Readonly<{ message: string }>;

export interface PuzzleFrontService {
  getSnapshot: () => PuzzleFrontSnapshot;
  subscribe: (listener: () => void) => () => void;
  submitAnswer: (puzzleId: string, move: string) => Promise<void>;
  goToPuzzles: () => void;
}

export type PuzzleFrontDependencies = Readonly<{
  puzzleService: PuzzleService;
  navigationService: NavigationService;
}>;
```

`src/services-front/puzzle/puzzle-service.ts` :

```ts
import type {
  PuzzleFrontDependencies,
  PuzzleFrontService,
  PuzzleFrontSnapshot,
  PuzzleFrontState,
} from './puzzle-type';

export const createPuzzleFrontService = (
  { puzzleService, navigationService }: PuzzleFrontDependencies,
): PuzzleFrontService => {
  let snapshot = createInitialSnapshot();
  const listeners = new Set<() => void>();

  // Les opérations consommatrices précèdent leur helper publish.
  const service: PuzzleFrontService = {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    submitAnswer: async (puzzleId, move) => {
      // Politique de cet exemple : ignorer un deuxième envoi pendant le premier.
      if (snapshot.status === 'loading') return;

      publish({ status: 'loading', answer: null });

      try {
        const answer = await puzzleService.checkAnswer(puzzleId, move);
        publish({ status: 'ready', answer: Object.freeze(answer) });
      } catch {
        publish({ status: 'error', answer: null });
      }
    },
    goToPuzzles: () => navigationService.goToPuzzles(),
  };

  const publish = (next: PuzzleFrontState): void => {
    snapshot = Object.freeze({ ...next, message: getMessage(next) });
    listeners.forEach((listener) => listener());
  };

  return service;
};

// Déclaration hoistée : utilisable par la fabrique placée au-dessus.
function createInitialSnapshot(): PuzzleFrontSnapshot {
  const state: PuzzleFrontState = { status: 'idle', answer: null };
  return Object.freeze({ ...state, message: getMessage(state) });
}

// Le service front choisit le message selon son état.
function getMessage(state: PuzzleFrontState): string {
  if (state.status === 'loading') return 'Vérification…';
  if (state.status === 'error') return 'La vérification a échoué.';
  if (!state.answer) return 'Choisis un coup.';
  if (state.answer.status === 'not-found') return 'Puzzle introuvable.';
  if (!state.answer.correct) return 'Essaie un autre coup.';

  return 'Bonne réponse !';
}
```

La closure porte l’état ; le contrat expose des snapshots immuables. Lire le
snapshot ne fabrique pas un nouvel objet. L’abonnement retourne une fonction
de nettoyage. Les erreurs et appels simultanés ont un comportement explicite.

## 2. Adaptateur navigation : contrat et implémentation nommée

`src/services-front/adapter/navigation/navigation-type.ts` :

```ts
export interface NavigationService {
  goToPuzzles: () => void;
}

export type NavigationExpoRouterDependencies = Readonly<{
  push: (path: '/puzzles') => void;
}>;
```

`src/services-front/adapter/navigation/navigation-service/index.ts` :

```ts
export { createNavigationExpoRouterService } from './navigation-expo-router-service';
```

`src/services-front/adapter/navigation/navigation-service/navigation-expo-router-service.ts` :

```ts
import type {
  NavigationExpoRouterDependencies,
  NavigationService,
} from '../navigation-type';

export const createNavigationExpoRouterService = (
  { push }: NavigationExpoRouterDependencies,
): NavigationService => ({ goToPuzzles: () => push('/puzzles') });
```

L’infrastructure fournit une fonction qui appelle le routeur Expo. Le service
front reçoit une opération de navigation, sans importer ce routeur. Une variante
pour une autre infrastructure rejoindrait le même dossier service.

## 3. Adaptateur React : binding vers la réactivité

`src/services-front/adapter/react/react-type.ts` :

```ts
import type { PuzzleFrontService, PuzzleFrontSnapshot } from '../../puzzle/puzzle-type';

export interface ReactService {
  usePuzzleState: (service: PuzzleFrontService) => PuzzleFrontSnapshot;
}
```

`src/services-front/adapter/react/react-service.ts` :

```ts
import { useSyncExternalStore } from 'react';
import type { PuzzleFrontService, PuzzleFrontSnapshot } from '../../puzzle/puzzle-type';
import type { ReactService } from './react-type';

export const createReactService = (): ReactService => ({ usePuzzleState });

function usePuzzleState(service: PuzzleFrontService): PuzzleFrontSnapshot {
  return useSyncExternalStore(service.subscribe, service.getSnapshot);
}
```

Ce hook est appelé au premier niveau d’une feature React, jamais depuis une
action métier ou conditionnellement. Le binding repose sur
[`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore).
Une nouvelle référence de snapshot signale une mise à jour ; les fonctions
d’abonnement et de lecture restent stables pendant la vie du service.

## 4. DI front : un seul fichier

`src/services-front/dependency-injection.ts` :

```ts
import type { ServicesBusiness } from '../services-business/dependency-injection';
import { createPuzzleFrontService } from './puzzle/puzzle-service';
import type { PuzzleFrontService } from './puzzle/puzzle-type';
import { createReactService } from './adapter/react/react-service';
import type { ReactService } from './adapter/react/react-type';
import { createNavigationExpoRouterService } from './adapter/navigation/navigation-service';
import type { NavigationExpoRouterDependencies } from './adapter/navigation/navigation-type';

export type ServicesFront = Readonly<{
  puzzleFrontService: PuzzleFrontService;
  reactService: ReactService;
}>;

type ServicesFrontDependencies = Readonly<{
  servicesBusiness: ServicesBusiness;
  push: NavigationExpoRouterDependencies['push'];
}>;

export const createServicesFront = (
  { servicesBusiness, push }: ServicesFrontDependencies,
): ServicesFront => {
  const navigationService = createNavigationExpoRouterService({ push });
  const puzzleFrontService = createPuzzleFrontService({
    puzzleService: servicesBusiness.puzzleService,
    navigationService,
  });

  return { puzzleFrontService, reactService: createReactService() };
};
```

Créer cet assemblage une fois pour sa durée de vie choisie, pas à chaque rendu
ou action. Un état d’écran peut avoir une instance par écran ; cette durée de
vie est explicite. Le contexte ou les props fournissent l’assemblage aux features.
La navigation et les repositories restent privés.

## 5. Component : affichage par props

`src/ui/components/puzzle-answer.tsx` :

```tsx
import { Pressable, Text, View } from 'react-native';

type PuzzleAnswerProps = Readonly<{
  busy: boolean;
  message: string;
  onSubmit: () => void;
}>;

export const PuzzleAnswer = ({ busy, message, onSubmit }: PuzzleAnswerProps) => (
  <View>
    <Text>{message}</Text>
    <Pressable disabled={busy} onPress={onSubmit}>
      <Text>{busy ? 'Vérification…' : 'Vérifier le coup'}</Text>
    </Pressable>
  </View>
);
```

Ce composant connaît ses props et sa présentation, sans accès au service ni au
routeur. Une vraie interface lui fournira le coup choisi par l’utilisateur.

## 6. Feature : câblage des composants et services front

`src/ui/features/puzzle-feature.tsx` :

```tsx
import type { ServicesFront } from '../../services-front/dependency-injection';
import { PuzzleAnswer } from '../components/puzzle-answer';

export const PuzzleFeature = (
  { servicesFront }: Readonly<{ servicesFront: ServicesFront }>,
) => {
  const { puzzleFrontService, reactService } = servicesFront;
  const snapshot = reactService.usePuzzleState(puzzleFrontService);

  return (
    <PuzzleAnswer
      busy={snapshot.status === 'loading'}
      message={snapshot.message}
      onSubmit={() => { void puzzleFrontService.submitAnswer('p1', 'e2e4'); }}
    />
  );
};
```

Le coup et l’identifiant sont fixes uniquement pour la démonstration. La feature
utilise le binding React et transmet des props et callbacks au composant. Le
service front porte le chargement, les messages et l’action ; le métier vérifie
la réponse. La feature ne reconstitue pas les messages à partir de l’état.

## 7. Raccordement au routeur

Une route Expo importe `PuzzleFeature` et lui fournit `servicesFront` depuis le
contexte applicatif. La racine React crée les assemblages métier et front pour
leur durée de vie et fournit le binding `push` vers le routeur. Les routes restent
minces ; elles ne construisent pas de repository ni ne portent les règles métier.

```text
route Expo
  → PuzzleFeature
    → binding React + PuzzleFrontService
      → PuzzleService
        → RepositoryService
    → PuzzleAnswer (props et callbacks)
```

## 8. Test front sans React, routeur ni stockage réel

`tests/services-front/puzzle-service.test.ts` :

```ts
import { createPuzzleFrontService } from '../../src/services-front/puzzle/puzzle-service';

describe('puzzle front service', () => {
  it('publishes loading and ready states, then cleans up the subscription', async () => {
    const service = createPuzzleFrontService({
      puzzleService: {
        checkAnswer: async () => ({ status: 'checked', correct: true, answeredAt: 1_000 }),
      },
      navigationService: { goToPuzzles: () => {} },
    });
    const states: string[] = [];
    const unsubscribe = service.subscribe(() => {
      states.push(service.getSnapshot().status);
    });
    const firstSnapshot = service.getSnapshot();

    expect(Object.is(service.getSnapshot(), firstSnapshot)).toEqual(true);
    const pending = service.submitAnswer('p1', 'e2e4');
    expect(service.getSnapshot().message).toEqual('Vérification…');
    await pending;
    expect(states).toEqual(['loading', 'ready']);
    expect(service.getSnapshot().message).toEqual('Bonne réponse !');
    expect(firstSnapshot.message).toEqual('Choisis un coup.');
    expect(firstSnapshot.status).toEqual('idle');

    unsubscribe();
    await service.submitAnswer('p1', 'e2e4');
    expect(states).toEqual(['loading', 'ready']);
  });
});
```

Le test vérifie l’état observable et le nettoyage de l’abonnement. Les tests de
composants et de bindings, quand nécessaires, restent distincts dans `tests/ui/`.

## 9. Test de l’assemblage front et de la navigation

`tests/services-front/dependency-injection.test.ts` :

```ts
import { createServicesBusiness } from '../../src/services-business/dependency-injection';
import { createServicesFront } from '../../src/services-front/dependency-injection';

describe('front services assembly', () => {
  it('routes through the injected navigation binding', () => {
    const routes: string[] = [];
    const servicesBusiness = createServicesBusiness({ puzzles: [], now: () => 1_000 });
    const front = createServicesFront({
      servicesBusiness,
      push: (path) => { routes.push(path); },
    });

    front.puzzleFrontService.goToPuzzles();
    expect(routes).toEqual(['/puzzles']);
  });
});
```

Ce test utilise le binding injecté en mémoire, sans démarrer le routeur Expo.
