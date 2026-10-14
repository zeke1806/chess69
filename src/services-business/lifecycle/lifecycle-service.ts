import * as R from 'remeda';
import type { LifecycleService, LifecycleData } from './lifecycle-types';

export function createLifecycleService(
  resources: readonly LifecycleService[],
  data: LifecycleData,
): LifecycleService {
  const managedResources = [...resources];
  return {
    initialize: () => {
      return enqueue(async () => {
        if (data.read().initialized) {
          return;
        }
        try {
          for (const resource of managedResources) {
            await resource.initialize();
          }
          data.update(R.set('initialized', true));
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
    const result = data.read().pending.then(operation);
    data.update(
      R.set(
        'pending',
        result.catch(() => undefined),
      ),
    );
    return result;
  }

  async function closeResources(): Promise<void> {
    data.update(R.set('initialized', false));
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
