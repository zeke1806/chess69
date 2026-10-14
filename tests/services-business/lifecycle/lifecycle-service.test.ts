import { createMemoryDataService } from '../../../src/services-business/adapters/data/memory-data-service';
import { createInitialLifecycleData } from '../../../src/services-business/lifecycle/lifecycle-types';
import { expect, test } from '@jest/globals';
import { createLifecycleService } from '../../../src/services-business/lifecycle/lifecycle-service';

// Every test crosses the public lifecycle contract without native resources.
test('construit sans effet, initialise une fois et permet la réouverture après fermeture', async () => {
  const events: string[] = [];
  const resources = ['repository', 'engine'].map((name) => ({
    initialize: async () => {
      events.push(`open:${name}`);
    },

    dispose: async () => {
      events.push(`close:${name}`);
    },
  }));
  const lifecycle = createLifecycleService(
    resources,
    createMemoryDataService().createData(createInitialLifecycleData()),
  );
  resources.length = 0;
  expect(events).toEqual([]);
  await Promise.all([lifecycle.initialize(), lifecycle.initialize()]);
  expect(events).toEqual(['open:repository', 'open:engine']);
  await lifecycle.dispose();
  expect(events.slice(2)).toEqual(['close:engine', 'close:repository']);
  await lifecycle.initialize();
  expect(events.slice(4)).toEqual(['open:repository', 'open:engine']);
});

test('un échec partiel ferme toutes les ressources, conserve l’erreur initiale et autorise le retry', async () => {
  let failing = true;
  const failure = new Error('initialization');
  const events: string[] = [];
  const lifecycle = createLifecycleService(
    [
      {
        initialize: async () => {
          events.push('open:repository');
        },

        dispose: async () => {
          events.push('close:repository');
          if (failing) {
            throw new Error('cleanup');
          }
        },
      },
      {
        initialize: async () => {
          events.push('open:engine');
          if (failing) {
            throw failure;
          }
        },

        dispose: async () => {
          events.push('close:engine');
        },
      },
    ],
    createMemoryDataService().createData(createInitialLifecycleData()),
  );
  await expect(lifecycle.initialize()).rejects.toBe(failure);
  expect(events).toEqual(['open:repository', 'open:engine', 'close:engine', 'close:repository']);
  failing = false;
  await lifecycle.initialize();
  expect(events.slice(4)).toEqual(['open:repository', 'open:engine']);
});

test('une fermeture qui lève synchroniquement ne saute pas les autres ressources', async () => {
  const failure = new Error('dispose');
  const closed: string[] = [];
  const lifecycle = createLifecycleService(
    [
      {
        initialize: async () => {},

        dispose: async () => {
          closed.push('repository');
        },
      },
      {
        initialize: async () => {},

        dispose: () => {
          closed.push('engine');
          throw failure;
        },
      },
    ],
    createMemoryDataService().createData(createInitialLifecycleData()),
  );
  await lifecycle.initialize();
  await expect(lifecycle.dispose()).rejects.toBe(failure);
  expect(closed).toEqual(['engine', 'repository']);
});
