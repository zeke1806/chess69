import { expect, test } from '@jest/globals';
import { createServicesBusiness } from '../../src/services-business/dependency-injection';
import { createMemoryRepositoryService } from '../../src/services-business/adapter/repository/repository-service';
import { createMemoryEngineService } from '../../src/services-business/adapter/engine/engine-service';
import { createEmptyState } from '../../src/services-business/adapter/repository/repository-type';
import type { RepositoryService } from '../../src/services-business/adapter/repository/repository-type';

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

function installedState() {
  const state = createEmptyState();
  state.attempts = [{ id: 'saved-attempt', contentId: 'lesson', kind: 'puzzle', outcome: 'success',
    at: '2026-10-13T10:00:00Z', day: '2026-10-13' }];
  state.games = [{ id: 'saved-game', color: 'b', level: 'beginner', moves: [], startedAt: '2026-10-13T11:00:00Z',
    finishedAt: null, result: null, day: null }];
  return state;
}

const clock = { now: () => new Date('2026-10-13T12:00:00Z') };
const ids = { id: () => 'new-id', random: () => 0.5 };

test('cleanup et remount pendant une ouverture SQLite suspendue gardent stockage et moteur utilisables', async () => {
  const memory = createMemoryRepositoryService({ initialState: installedState() });
  const entered = deferred(); const released = deferred(); let first = true;
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = (action: () => Promise<void>) => {
    const result = pending.then(action); pending = result.catch(() => undefined); return result;
  };
  // The repository double retains the native adapter's own resource queue.
  const repository: RepositoryService = {
    ...memory,
    initialize: () => enqueue(async () => {
      if (first) { first = false; entered.resolve(); await released.promise; }
      await memory.initialize();
    }),
    dispose: () => enqueue(memory.dispose),
  };
  const services = createServicesBusiness({ repository, engine: createMemoryEngineService(), clock, ids });
  const opening = services.initialize(); await entered.promise;
  const cleanup = services.dispose(); const remount = services.initialize();
  released.resolve(); await Promise.all([opening, cleanup, remount]);
  expect((await services.progression.summary()).successes).toBe(1);
  expect((await services.game.think())?.record).toMatchObject({ id: 'saved-game', moves: ['a2a3'] });
  expect((await services.game.resume())?.record.moves).toEqual(['a2a3']);
});

test('une initialisation moteur échouée libère la base sans perdre les données et autorise le retry', async () => {
  const repository = createMemoryRepositoryService({ initialState: installedState() });
  const memory = createMemoryEngineService(); let unavailable = true;
  const services = createServicesBusiness({ repository, clock, ids, engine: {
    ...memory, initialize: async () => { await memory.initialize(); if (unavailable) throw new Error('Moteur indisponible'); },
  } });
  await expect(services.initialize()).rejects.toThrow('Moteur indisponible');
  await expect(services.progression.summary()).rejects.toThrow('initialisé');
  unavailable = false; await services.initialize();
  expect((await services.progression.summary()).successes).toBe(1);
  expect((await services.game.think())?.record.moves).toEqual(['a2a3']);
});

test('une fermeture moteur en erreur ferme aussi le stockage et ne bloque pas la réinitialisation', async () => {
  const repository = createMemoryRepositoryService({ initialState: installedState() });
  const memory = createMemoryEngineService(); let first = true;
  const services = createServicesBusiness({ repository, clock, ids, engine: {
    ...memory, dispose: async () => { await memory.dispose(); if (first) { first = false; throw new Error('Fermeture moteur échouée'); } },
  } });
  await services.initialize();
  await expect(services.dispose()).rejects.toThrow('Fermeture moteur échouée');
  await expect(services.progression.summary()).rejects.toThrow('initialisé');
  await services.initialize();
  expect((await services.progression.summary()).successes).toBe(1);
  expect((await services.game.think())?.record.moves).toEqual(['a2a3']);
});
