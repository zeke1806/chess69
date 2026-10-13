import { describe, expect, it } from '@jest/globals';
import { createMemoryRepositoryService } from '../../src/services-business/adapter/repository/repository-service';

describe('progression locale', () => {
  it('sérialise les résultats simultanés sans perdre de progression', async () => {
    const repository = createMemoryRepositoryService();
    await repository.initialize();
    await Promise.all(['a', 'b'].map((id) => repository.updateState((state) => ({
      ...state, attempts: [...state.attempts, { id, contentId: 'puzzle-1', kind: 'puzzle', outcome: 'success', at: '2026-10-13T10:00:00Z', day: '2026-10-13' }],
    }))));
    expect((await repository.readState()).attempts.map(({ id }) => id)).toEqual(['a', 'b']);
  });
});

it('une écriture rejetée préserve les données et permet la suivante', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  await repository.updateState((state) => ({ ...state, preferences: { ...state.preferences, onboarded: true } }));
  await expect(repository.updateState(() => { throw new Error('Disque indisponible'); })).rejects.toThrow('Disque indisponible');
  expect((await repository.readState()).preferences.onboarded).toBe(true);
  await repository.updateState((state) => ({ ...state, preferences: { ...state.preferences, level: 'club' } }));
  expect((await repository.readState()).preferences.level).toBe('club');
});

it('les snapshots retournés ne permettent pas de modifier la progression sauvegardée', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const snapshot = await repository.readState();
  snapshot.preferences.onboarded = true;
  expect((await repository.readState()).preferences.onboarded).toBe(false);
  await repository.dispose();
  await expect(repository.readState()).rejects.toThrow('initialisé');
  await repository.initialize();
  expect((await repository.readState()).preferences.onboarded).toBe(false);
});
