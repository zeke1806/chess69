import * as R from 'remeda';
import { createServicesFront } from '../../src/services/di';
import { createLearningService } from '../../src/services-business/learning/learning-service';
import { createServicesBusiness, type ServicesBusiness } from '../../src/services-business/di';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';
import { createMemoryEngineService } from '../../src/services-business/adapters/engine/engine-service';
import {
  createEmptyState,
  type RepositoryService,
  type StoredState,
} from '../../src/services-business/adapters/repository/repository-types';
import type {
  CatalogueService,
  Exercise,
} from '../../src/services-business/catalogue/catalogue-types';
import type { OrchestrationService } from '../../src/services/orchestration/orchestration-types';

export function connect(service: OrchestrationService) {
  let state = service.createInitialState();
  let active = true;
  const actions = service.connect({
    isActive: () => {
      return active;
    },
    getState: () => {
      return state;
    },
    setState: (update) => {
      if (active) {
        state = update(state);
      }
    },
    bindings: undefined,
  });
  return {
    actions,
    get state() {
      return state;
    },
    stop: () => {
      active = false;
    },
  };
}
export function deferred() {
  let resolve = (): void => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
export function gameContext(
  initialState: StoredState = createEmptyState(),
  catalogue?: CatalogueService,
) {
  let failWrite = false;
  let failInit = false;
  let heldWrite: Readonly<{
    entered: ReturnType<typeof deferred>;
    released: ReturnType<typeof deferred>;
  }> | null = null;
  const memory = createMemoryRepositoryService({ initialState });
  const repository: RepositoryService = {
    ...memory,
    initialize: async () => {
      if (failInit) {
        throw new Error('database');
      }
      await memory.initialize();
    },
    learning: {
      saveAttempt: async (...args) => {
        if (failWrite) {
          throw new Error('disk');
        }
        return memory.learning.saveAttempt(...args);
      },
    },
    game: {
      ...memory.game,
      save: async (...args) => {
        const held = heldWrite;
        heldWrite = null;
        if (held) {
          held.entered.resolve();
          await held.released.promise;
        }
        return memory.game.save(...args);
      },
    },
  };
  let sequence = 0;
  const base = createServicesBusiness({
    repository,
    engine: createMemoryEngineService(),
    clock: {
      now: () => {
        return new Date('2026-10-13T12:00:00Z');
      },
    },
    ids: {
      id: () => {
        return `id-${++sequence}`;
      },
      random: () => {
        return 0.5;
      },
    },
  });
  // A custom catalogue needs its own Learning factory; standard scenarios use the composed business module.
  const business: ServicesBusiness = catalogue
    ? {
        ...base,
        catalogue,
        createLearning: () => {
          return createLearningService({
            catalogue,
            repository: repository.learning,
            rules: base.rules,
            clock: {
              now: () => {
                return new Date('2026-10-13T12:00:00Z');
              },
            },
            ids: {
              id: () => {
                return `attempt-${++sequence}`;
              },
            },
          });
        },
      }
    : base;
  const definition = createServicesFront({
    business,
    version: '0.2.0',
  }).orchestration.createOrchestrationService();
  return {
    connection: connect(definition),
    definition,
    business,
    repository,
    failWrite: (value: boolean) => {
      failWrite = value;
    },
    failInit: (value: boolean) => {
      failInit = value;
    },
    holdNextWrite: () => {
      const entered = deferred();
      const released = deferred();
      heldWrite = { entered, released };
      return { entered: entered.promise, release: released.resolve };
    },
  };
}

const exercise: Exercise = {
  id: 'lesson',
  kind: 'puzzle',
  title: 'Mat',
  theme: 'Mat',
  difficulty: 'beginner',
  fen: '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1',
  moves: ['f7g7'],
  alternatives: [],
  explanation: 'La dame mate avec le roi.',
  hints: ['La dame.'],
  side: 'w',
  goal: 'checkmate',
  objective: 'Matez en un coup',
};
export const catalogue: CatalogueService = {
  list: () => {
    return [exercise];
  },
  get: (id) => {
    return id === exercise.id ? exercise : undefined;
  },
  openings: () => {
    return [];
  },
};

export function recordedGame(id: string, finished: boolean): StoredState['games'][number] {
  return {
    id,
    color: 'w',
    level: 'beginner',
    moves: [],
    startedAt: '2026-10-13T11:00:00Z',
    finishedAt: finished ? '2026-10-13T11:30:00Z' : null,
    result: finished ? '0-1' : null,
    day: finished ? '2026-10-13' : null,
  };
}
export function analyzedState(): StoredState {
  const base = gameContext();
  const moves = ['f2f3', 'e7e5', 'g2g4', 'd8h4'];
  return R.pipe(
    createEmptyState(),
    R.set('games', [{ ...recordedGame('finished', true), moves }]),
    R.set('analyses', {
      finished: {
        gameId: 'finished',
        complete: true,
        positions: Array.from({ length: 5 }, (_, ply) => ({
          ply,
          fen: base.business.rules.position(undefined, moves.slice(0, ply)).fen,
          bestMove: ply === 4 ? null : ply === 1 ? 'e7e5' : 'e2e4',
          score: { type: 'cp' as const, value: ply === 0 ? 125 : 50 },
          pv: ply === 4 ? [] : ['e7e5', 'g1f3'],
        })),
      },
    }),
  );
}

export function front(business: ServicesBusiness) {
  return connect(
    createServicesFront({ business, version: '0.2.0' }).orchestration.createOrchestrationService(),
  );
}
