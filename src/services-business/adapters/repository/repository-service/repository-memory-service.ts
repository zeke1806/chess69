import { createRepositoryPorts } from './repository-ports';
import { createEmptyState, storedStateSchema } from '../repository-types';
import type { RepositoryService, MemoryRepositoryDependencies } from '../repository-types';

export const createMemoryRepositoryService = ({
  initialState = createEmptyState(),
}: MemoryRepositoryDependencies = {}): RepositoryService => {
  let state = storedStateSchema.parse(initialState);
  let initialized = false;
  let pending: Promise<unknown> = Promise.resolve();
  return createRepositoryPorts({
    initialize: () => {
      return enqueue(() => {
        initialized = true;
      });
    },

    readState: () => {
      return enqueue(() => {
        requireInitialized();
        return storedStateSchema.parse(state);
      });
    },

    updateState: (update) => {
      return enqueue(() => {
        requireInitialized();
        const next = storedStateSchema.parse(update(storedStateSchema.parse(state)));
        state = next;
        return storedStateSchema.parse(next);
      });
    },

    dispose: () => {
      return enqueue(() => {
        initialized = false;
      });
    },
  });

  function enqueue<T>(action: () => T | Promise<T>): Promise<T> {
    const operation = pending.then(action);
    pending = operation.catch(() => undefined);
    return operation;
  }

  function requireInitialized(): void {
    if (!initialized) {
      throw new Error('Le stockage local doit être initialisé.');
    }
  }
};
