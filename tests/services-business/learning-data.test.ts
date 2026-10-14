import { expect, test } from '@jest/globals';
import { createServicesBusiness } from '../../src/services-business/di';
import { createLearningService } from '../../src/services-business/learning/learning-service';
import { createMemoryDataService } from '../../src/services-business/adapters/data/memory-data-service';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';
import { createMemoryEngineService } from '../../src/services-business/adapters/engine/engine-service';

const clock = {
  now: () => {
    return new Date('2026-10-14T12:00:00Z');
  },
};
const ids = {
  id: () => {
    return 'attempt';
  },

  random: () => {
    return 0;
  },
};

test('recréer la logique Learning conserve la session dans le stockage fourni', () => {
  const repository = createMemoryRepositoryService();
  const business = createServicesBusiness({
    repository,
    engine: createMemoryEngineService(),
    clock,
    ids,
  });
  const data = createMemoryDataService();
  const session = data.createData(business.learning.createInitialSession());
  const exercise = business.catalogue.list({ kind: 'opening' })[0]!;
  business.learning.start(session, exercise.id, 'w', 'guided');
  const snapshot = business.learning.snapshot(session);
  const recreated = createLearningService({
    repository: repository.learning,
    catalogue: business.catalogue,
    rules: business.rules,
    clock,
    ids,
  });
  expect(recreated.snapshot(session)).toBe(snapshot);
  recreated.hint(session);
  expect(business.learning.snapshot(session)?.assisted).toBe(true);
  expect(snapshot?.hint).toBeNull();
});

test('un service Learning partagé utilise deux stockages indépendants', () => {
  const business = createServicesBusiness({
    repository: createMemoryRepositoryService(),
    engine: createMemoryEngineService(),
    clock,
    ids,
  });
  const data = createMemoryDataService();
  const first = data.createData(business.learning.createInitialSession());
  const second = data.createData(business.learning.createInitialSession());
  const exercises = business.catalogue.list({ kind: 'opening' });
  business.learning.start(first, exercises[0]!.id, 'w');
  business.learning.start(second, exercises[1]!.id, 'w');
  const other = business.learning.snapshot(second);
  business.learning.hint(first);
  expect(business.learning.snapshot(second)).toBe(other);
  expect(business.learning.snapshot(first)?.exercise.id).not.toBe(other?.exercise.id);
});

test('deux instances de logique respectent la même sauvegarde en cours et le résultat enregistré', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const business = createServicesBusiness({
    repository,
    engine: createMemoryEngineService(),
    clock,
    ids,
  });
  let release!: () => void;
  const pendingSave = new Promise<void>((resolve) => {
    release = resolve;
  });
  const dependencies = {
    catalogue: business.catalogue,
    rules: business.rules,
    clock,
    ids,
    repository: {
      saveAttempt: async (...args: Parameters<typeof repository.learning.saveAttempt>) => {
        await pendingSave;
        return repository.learning.saveAttempt(...args);
      },
    },
  };
  const first = createLearningService(dependencies);
  const second = createLearningService(dependencies);
  const session = createMemoryDataService().createData(first.createInitialSession());
  first.start(session, business.catalogue.list({ kind: 'puzzle' })[0]!.id);
  first.reveal(session);
  const saving = first.finish(session);
  expect(await second.finish(session)).toEqual({ ok: false, reason: 'saving' });
  release();
  const result = await saving;
  expect(result.ok).toBe(true);
  expect(await second.finish(session)).toBe(result);
  expect((await repository.progression.read()).attempts).toHaveLength(1);
});
