import { createDatabaseFixture, failNextSQLiteWrite, cleanDatabaseFixtures } from './fixtures';
import { createEmptyState } from '../../../src/services-business/adapters/repository/repository-types';
import { afterAll, expect, jest, test } from '@jest/globals';
import {
  createMemoryRepositoryService,
  createSQLiteRepositoryService,
} from '../../../src/services-business/adapters/repository/repository-service';
import type { Attempt, Review } from '../../../src/services-business/learning/learning-types';

const attempt: Attempt = {
  id: 'tentative-1',
  contentId: 'italienne',
  kind: 'opening',
  outcome: 'success',
  at: '2026-10-14T12:00:00Z',
  day: '2026-10-14',
};
const review: Review = {
  contentId: 'italienne',
  color: 'w',
  stage: 1,
  streak: 0,
  due: '2026-10-15T12:00:00Z',
};

test('01 — la tentative et sa révision se sauvegardent ensemble sans exposer le stockage global', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  await expect(
    repository.learning.saveAttempt(attempt, 'italienne:w', () => {
      throw new Error('révision indisponible');
    }),
  ).rejects.toThrow('révision indisponible');
  expect((await repository.progression.read()).attempts).toEqual([]);
  expect((await repository.progression.read()).reviews).toEqual({});
  await repository.learning.saveAttempt(attempt, 'italienne:w', () => review);
  expect(await repository.progression.read()).toMatchObject({
    attempts: [attempt],
    reviews: { 'italienne:w': review },
  });
  expect('readState' in repository).toBe(false);
  expect('updateState' in repository).toBe(false);
});

test('02 — démarrer une partie et retenir ses préférences forment une écriture atomique', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const record = {
    id: 'partie-1',
    color: 'w' as const,
    level: 'club' as const,
    moves: [],
    startedAt: '2026-10-14',
    finishedAt: null,
    result: null,
    day: null,
  };
  await expect(
    repository.game.start({
      record,
      options: { color: 'b', level: 'invalide' as 'club' },
      expectedActiveId: null,
      replaced: null,
    }),
  ).rejects.toThrow();
  expect(await repository.game.active()).toBeNull();
  expect(await repository.progression.preferences()).toEqual({
    color: 'w',
    level: 'beginner',
    onboarded: false,
  });
  expect(
    await repository.game.start({
      record,
      options: { color: 'random', level: 'club' },
      expectedActiveId: null,
      replaced: null,
    }),
  ).toBe(true);
  expect(await repository.game.active()).toEqual(record);
  expect(await repository.progression.preferences()).toEqual({
    color: 'random',
    level: 'club',
    onboarded: false,
  });
});

test('03 — une sauvegarde obsolète ne perd aucun coup et les valeurs précédentes restent intactes', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const record = {
    id: 'partie-1',
    color: 'w' as const,
    level: 'club' as const,
    moves: [],
    startedAt: '2026-10-14',
    finishedAt: null,
    result: null,
    day: null,
  };
  await repository.game.start({
    record,
    options: { color: 'w', level: 'club' },
    expectedActiveId: null,
    replaced: null,
  });
  const before = await repository.game.active();
  const next = { ...record, moves: ['e2e4'] };
  expect(await repository.game.save(record, next)).toBe(true);
  expect(await repository.game.save(record, { ...record, moves: ['d2d4'] })).toBe(false);
  expect(before?.moves).toEqual([]);
  expect((await repository.game.active())?.moves).toEqual(['e2e4']);
  expect(record.moves).toEqual([]);
});

test('04 — une analyse annulée ne conserve aucun checkpoint tardif', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const checkpoint = {
    gameId: 'partie-1',
    complete: false,
    positions: [
      {
        ply: 0,
        fen: 'fen',
        bestMove: 'e2e4',
        score: { type: 'cp' as const, value: 12 },
        pv: ['e2e4'],
      },
    ],
  };
  let active = true;
  const pending = repository.analysis.saveCheckpoint(checkpoint, () => active);
  active = false;
  expect(await pending).toBeNull();
  expect((await repository.analysis.load('partie-1')).record).toBeNull();
});

test('05 — remplacer une partie depuis un état obsolète refuse de perdre le dernier coup', async () => {
  const repository = createMemoryRepositoryService();
  await repository.initialize();
  const record = {
    id: 'partie-1',
    color: 'w' as const,
    level: 'club' as const,
    moves: [],
    startedAt: '2026-10-14',
    finishedAt: null,
    result: null,
    day: null,
  };
  await repository.game.start({
    record,
    options: { color: 'w', level: 'club' },
    expectedActiveId: null,
    replaced: null,
  });
  await repository.game.save(record, { ...record, moves: ['e2e4'] });
  expect(
    await repository.game.start({
      record: { ...record, id: 'partie-2' },
      options: { color: 'b', level: 'beginner' },
      expectedActiveId: record.id,
      replaced: { ...record, result: '0-1', finishedAt: '2026-10-14', day: '2026-10-14' },
    }),
  ).toBe(false);
  expect((await repository.game.active())?.moves).toEqual(['e2e4']);
  expect((await repository.progression.preferences()).level).toBe('club');
});

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: require('./fixtures').openDatabaseAsync }));
afterAll(cleanDatabaseFixtures);

test('06 — SQLite rouvre les données version 1 et annule une écriture échouée avant un retry', async () => {
  const oldState = {
    ...createEmptyState(),
    attempts: [attempt],
    reviews: { 'italienne:w': review },
  };
  const databaseName = createDatabaseFixture(oldState);
  const repository = createSQLiteRepositoryService({ databaseName });
  await repository.initialize();
  expect((await repository.progression.read()).attempts).toEqual([attempt]);
  failNextSQLiteWrite(databaseName);
  await expect(
    repository.learning.saveAttempt({ ...attempt, id: 'tentative-2' }, 'italienne:w', () => ({
      ...review,
      stage: 2,
    })),
  ).rejects.toThrow('Disque indisponible');
  expect(await repository.progression.read()).toMatchObject({
    attempts: [attempt],
    reviews: { 'italienne:w': review },
  });
  await repository.learning.saveAttempt({ ...attempt, id: 'tentative-2' }, 'italienne:w', () => ({
    ...review,
    stage: 2,
  }));
  await repository.dispose();
  const reopened = createSQLiteRepositoryService({ databaseName });
  await reopened.initialize();
  expect((await reopened.progression.read()).attempts.map(({ id }) => id)).toEqual([
    'tentative-1',
    'tentative-2',
  ]);
  expect((await reopened.progression.read()).reviews['italienne:w']?.stage).toBe(2);
  await reopened.dispose();
});

test('07 — une migration SQLite échouée reste réessayable sans réinitialiser la progression', async () => {
  const databaseName = createDatabaseFixture();
  const repository = createSQLiteRepositoryService({ databaseName });
  failNextSQLiteWrite(databaseName);
  await expect(repository.initialize()).rejects.toThrow('Disque indisponible');
  await repository.initialize();
  await repository.learning.saveAttempt(attempt);
  await repository.dispose();
  await repository.initialize();
  expect((await repository.progression.read()).attempts).toEqual([attempt]);
  await repository.dispose();
});

test('08 — SQLite protège une base de version future sans la remplacer', async () => {
  const databaseName = createDatabaseFixture({ ...createEmptyState(), attempts: [attempt] }, 2);
  const repository = createSQLiteRepositoryService({ databaseName });
  await expect(repository.initialize()).rejects.toThrow('version plus récente');
  await expect(repository.initialize()).rejects.toThrow('version plus récente');
  await repository.dispose();
});
