import type { LifecycleService } from './lifecycle-types';

export function createLifecycleService(resources: readonly LifecycleService[]): LifecycleService {
  let initialized = false;
  let pending: Promise<unknown> = Promise.resolve();
  const managedResources = [...resources];

  return {
    initialize: () => {
      return enqueue(async () => {
        if (initialized) {
          return;
        }
        try {
          for (const resource of managedResources) {
            await resource.initialize();
          }
          initialized = true;
        } catch (error) {
          // Preserve the initialization error while releasing partial resources.
          await closeResources().catch(() => undefined);
          throw error;
        }
      });
    },

    dispose: () => {
      return enqueue(closeResources);
    },
  };

  function enqueue(operation: () => Promise<void>): Promise<void> {
    const result = pending.then(operation);
    pending = result.catch(() => undefined);
    return result;
  }

  async function closeResources(): Promise<void> {
    initialized = false;
    const results = await Promise.allSettled(
      managedResources.toReversed().map(async (resource) => resource.dispose()),
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  }
}
