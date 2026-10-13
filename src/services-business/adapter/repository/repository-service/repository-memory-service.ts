import { createEmptyState, storedStateSchema } from '../repository-type';
import type { RepositoryService, MemoryRepositoryDependencies } from '../repository-type';

export const createMemoryRepositoryService = ({ initialState = createEmptyState() }: MemoryRepositoryDependencies = {}): RepositoryService => {
  let state = storedStateSchema.parse(initialState);
  let initialized = false;
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(action: () => T | Promise<T>): Promise<T> => {
    const operation = pending.then(action);
    pending = operation.catch(() => undefined);
    return operation;
  };
  const requireInitialized = (): void => {
    if (!initialized) throw new Error('Le stockage local doit être initialisé.');
  };
  return {
    initialize: () => enqueue(() => { initialized = true; }),
    readState: () => enqueue(() => { requireInitialized(); return storedStateSchema.parse(state); }),
    updateState: (update) => enqueue(() => {
      requireInitialized();
      const next = storedStateSchema.parse(update(storedStateSchema.parse(state)));
      state = next;
      return storedStateSchema.parse(next);
    }),
    dispose: () => enqueue(() => { initialized = false; }),
  };
};
