import { describe, expect, it } from '@jest/globals';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';

describe('progression locale', () => {
  it('sérialise les résultats simultanés sans perdre de progression', async () => {
    const repository = createMemoryRepositoryService();
    await repository.initialize();
    await Promise.all(
      ['a', 'b'].map((id) =>
        repository.learning.saveAttempt({
          id,
          contentId: 'puzzle-1',
          kind: 'puzzle',
          outcome: 'success',
          at: '2026-10-13T10:00:00Z',
          day: '2026-10-13',
        }),
      ),
    );
    expect((await repository.progression.read()).attempts.map(({ id }) => id)).toEqual(['a', 'b']);
  });
});

it('une écriture rejetée préserve les données et permet la suivante', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  await repository.progression.markOnboarded();
  await expect(
    repository.learning.saveAttempt(
      {
        id: 'a',
        contentId: 'opening',
        kind: 'opening',
        outcome: 'success',
        at: '2026-10-13',
        day: '2026-10-13',
      },
      'opening:w',
      () => {
        throw new Error('Disque indisponible');
      },
    ),
  ).rejects.toThrow('Disque indisponible');
  expect((await repository.progression.preferences()).onboarded).toBe(true);
  await repository.game.start({
    record: {
      id: 'g',
      color: 'w',
      level: 'club',
      moves: [],
      startedAt: '2026-10-13',
      finishedAt: null,
      result: null,
      day: null,
    },
    options: { color: 'w', level: 'club' },
    expectedActiveId: null,
    replaced: null,
  });
  expect((await repository.progression.preferences()).level).toBe('club');
});

it('les snapshots retournés ne permettent pas de modifier la progression sauvegardée', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const snapshot = await repository.progression.read();
  expect(Reflect.set(snapshot.preferences, 'onboarded', true)).toBe(false);
  expect((await repository.progression.preferences()).onboarded).toBe(false);
  await repository.dispose();
  await expect(repository.progression.read()).rejects.toThrow('initialisé');
  await repository.initialize();
  expect((await repository.progression.preferences()).onboarded).toBe(false);
});
