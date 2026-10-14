import type { EngineService, EngineLifecycleOperations } from '../engine-types';
import { engineEvaluationSchema } from '../engine-types';
/** Shared lifecycle makes the memory double exercise the same cancellation seam. */
export const createEngineLifecycle = (operations: EngineLifecycleOperations): EngineService => {
  let generation = 0;
  let ready = false;
  let active: symbol | null = null;
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = pending.then(operation);
    pending = result.catch(() => undefined);
    return result;
  };
  return {
    initialize: () => {
      return enqueue(async () => {
        if (ready) {
          return;
        }
        await operations.initialize();
        ready = true;
      });
    },
    evaluate: (fen, options, signal) => {
      const requestedGeneration = generation;
      return enqueue(async () => {
        if (signal?.aborted || requestedGeneration !== generation) {
          throw aborted();
        }
        if (!ready) {
          throw new Error('Le moteur local doit être initialisé.');
        }
        const token = Symbol();
        active = token;
        const stop = (): void => {
          if (active === token) {
            void operations.cancel().catch(() => undefined);
          }
        };
        signal?.addEventListener('abort', stop, { once: true });
        try {
          const result = await operations.evaluate(fen, options);
          if (signal?.aborted || requestedGeneration !== generation) {
            throw aborted();
          }
          return engineEvaluationSchema.parse(result);
        } finally {
          signal?.removeEventListener('abort', stop);
          if (active === token) {
            active = null;
          }
        }
      });
    },
    cancel: async () => {
      generation += 1;
      await operations.cancel();
    },
    dispose: async () => {
      generation += 1;
      await operations.cancel();
      await enqueue(async () => {
        ready = false;
        await operations.dispose();
      });
    },
  };
};

const aborted = (): Error => {
  const error = new Error('Calcul annulé.');
  error.name = 'AbortError';
  return error;
};
