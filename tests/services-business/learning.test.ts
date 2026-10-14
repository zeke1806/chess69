import { expect, test } from '@jest/globals';
import { Chess } from 'chess.js';
import { createChessJsRulesService } from '../../src/services-business/adapters/rules/chess-js-rules-service';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';
import type { LearningRepository } from '../../src/services-business/learning/learning-types';
import { createLearningService } from '../../src/services-business/learning/learning-service';
import type {
  CatalogueService,
  Exercise,
} from '../../src/services-business/catalogue/catalogue-types';

const opening: Exercise = {
  id: 'test-italian',
  kind: 'opening',
  title: 'Italienne',
  theme: 'Développement',
  difficulty: 'beginner',
  fen: new Chess().fen(),
  moves: ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4'],
  alternatives: [],
  explanation: 'Développez les pièces et contrôlez le centre.',
  hints: ['Avancez le pion roi.'],
  side: 'w',
  goal: 'opening-plan',
  objective: 'Développer les pièces.',
};

function setup(exercise = opening) {
  const repository = createMemoryRepositoryService();
  void repository.initialize();
  let failSave = false;
  let currentDate = new Date(2026, 9, 13, 14);
  let sequence = 0;
  let waitForSave: Promise<void> | null = null;
  const learningRepository: LearningRepository = {
    saveAttempt: async (...args) => {
      if (waitForSave) {
        await waitForSave;
      }
      if (failSave) {
        throw new Error('disk-full');
      }
      return repository.learning.saveAttempt(...args);
    },
  };
  const catalogue: CatalogueService = {
    list: () => {
      return [exercise];
    },
    get: (id) => {
      return id === exercise.id ? exercise : undefined;
    },
    openings: () => {
      return [];
    },
  };
  const service = createLearningService({
    repository: learningRepository,
    catalogue,
    clock: {
      now: () => {
        return currentDate;
      },
    },
    ids: {
      id: () => {
        return `attempt-${++sequence}`;
      },
    },
    rules: createChessJsRulesService(),
  });
  return {
    service,
    repository,
    fail: (value: boolean) => {
      failSave = value;
    },
    date: (value: Date) => {
      currentDate = value;
    },
    pauseSave: () => {
      let resolve!: () => void;
      waitForSave = new Promise<void>((done) => {
        resolve = done;
      });
      return () => {
        resolve();
        waitForSave = null;
      };
    },
  };
}

test('un entraînement joue les réponses adverses et sauvegarde un succès avec une première révision demain', async () => {
  const { service, repository } = setup();
  service.start(opening.id, 'w', 'memory');
  service.play('e2e4');
  expect(service.snapshot()?.ply).toBe(2);
  service.play('g1f3');
  service.play('f1c4');
  const result = await service.finish();
  expect(result).toMatchObject({
    ok: true,
    attempt: { outcome: 'success', day: '2026-10-13' },
    review: { stage: 1, streak: 0, due: new Date(2026, 9, 14, 14).toISOString() },
  });
  expect((await repository.progression.read()).attempts).toHaveLength(1);
});

async function complete(service: ReturnType<typeof createLearningService>, color: 'w' | 'b' = 'w') {
  service.start(opening.id, color, 'memory');
  for (const move of color === 'w' ? ['e2e4', 'g1f3', 'f1c4'] : ['e7e5', 'b8c6']) {
    service.play(move);
  }
  return service.finish();
}

test('rejouer une ouverture avant son échéance ne crée pas de maîtrise artificielle', async () => {
  const { service } = setup();
  await complete(service);
  await complete(service);
  await complete(service);
  const result = await complete(service);
  expect(result).toMatchObject({
    ok: true,
    review: { stage: 1, streak: 0, due: new Date(2026, 9, 14, 14).toISOString() },
  });
});

test('les blancs et noirs ont des révisions distinctes et les puzzles ne créent aucune révision d’ouverture', async () => {
  const { service, repository } = setup();
  await complete(service, 'w');
  await complete(service, 'b');
  const state = await repository.progression.read();
  expect(Object.keys(state.reviews)).toEqual(['test-italian:w', 'test-italian:b']);
  expect(state.reviews['test-italian:b']).toMatchObject({ color: 'b', stage: 1, streak: 0 });
  const puzzle = setup({ ...opening, kind: 'puzzle' });
  await complete(puzzle.service);
  expect((await puzzle.repository.progression.read()).reviews).toEqual({});
  expect(await puzzle.service.finish()).toMatchObject({ ok: true, review: null });
});

test('les échéances successives sont de 1, 3, 7, 14 et 30 jours et seules les révisions dues consolident', async () => {
  const { service, date } = setup();
  await complete(service);
  date(new Date(2026, 9, 14, 14));
  expect(await complete(service)).toMatchObject({
    review: { stage: 2, streak: 1, due: new Date(2026, 9, 17, 14).toISOString() },
  });
  date(new Date(2026, 9, 17, 14));
  expect(await complete(service)).toMatchObject({
    review: { stage: 3, streak: 2, due: new Date(2026, 9, 24, 14).toISOString() },
  });
  date(new Date(2026, 9, 24, 14));
  expect(await complete(service)).toMatchObject({
    review: { stage: 4, streak: 3, due: new Date(2026, 10, 7, 14).toISOString() },
  });
  date(new Date(2026, 10, 7, 14));
  expect(await complete(service)).toMatchObject({
    review: { stage: 5, streak: 4, due: new Date(2026, 11, 7, 14).toISOString() },
  });
});

test('une erreur empêche le succès sans aide et remet le camp au premier entraînement', async () => {
  const { service, date } = setup();
  await complete(service);
  date(new Date(2026, 9, 14, 14));
  service.start(opening.id, 'w', 'memory');
  const before = service.snapshot()?.fen;
  expect(service.play('d2d4')).toMatchObject({
    ok: true,
    snapshot: { errorCount: 1, feedback: 'incorrect', expectedMove: 'e2e4' },
  });
  expect(service.snapshot()?.fen).toBe(before);
  service.play('e2e4');
  service.play('g1f3');
  service.play('f1c4');
  expect(await service.finish()).toMatchObject({
    ok: true,
    attempt: { outcome: 'failed' },
    review: { stage: 0, streak: 0, due: new Date(2026, 9, 14, 14).toISOString() },
  });
});

test('un indice, une solution montrée et le mode guidé restent des tentatives avec aide', async () => {
  const { service } = setup();
  service.start(opening.id, 'w', 'memory');
  service.hint();
  service.play('e2e4');
  service.play('g1f3');
  service.play('f1c4');
  expect(await service.finish()).toMatchObject({
    attempt: { outcome: 'assisted' },
    review: { stage: 0, streak: 0 },
  });
  service.start(opening.id);
  service.reveal();
  expect(service.snapshot()).toMatchObject({ status: 'revealed', assisted: true, ply: 5 });
  expect(await service.finish()).toMatchObject({ attempt: { outcome: 'assisted' } });
  service.start(opening.id, 'w', 'guided');
  expect(service.snapshot()?.expectedMove).toBe('e2e4');
  service.play('e2e4');
  service.play('g1f3');
  service.play('f1c4');
  expect(await service.finish()).toMatchObject({ attempt: { outcome: 'assisted' } });
});

test('une sauvegarde échouée reste réessayable et ne double jamais la tentative', async () => {
  const { service, repository, fail } = setup();
  fail(true);
  expect(await complete(service)).toEqual({ ok: false, reason: 'save-failed' });
  expect(service.snapshot()?.status).toBe('completed');
  expect((await repository.progression.read()).attempts).toEqual([]);
  fail(false);
  expect(await service.finish()).toMatchObject({ ok: true, attempt: { outcome: 'success' } });
  expect(service.snapshot()?.status).toBe('saved');
  await service.finish();
  expect((await repository.progression.read()).attempts).toHaveLength(1);
});

test('une sauvegarde en cours protège la tentative contre les actions et doublons concurrents', async () => {
  const { service, repository, pauseSave } = setup();
  const release = pauseSave();
  const pending = complete(service);
  expect(service.start(opening.id)).toEqual({ ok: false, reason: 'saving' });
  expect(service.reveal()).toEqual({ ok: false, reason: 'saving' });
  expect(await service.finish()).toEqual({ ok: false, reason: 'saving' });
  release();
  expect(await pending).toMatchObject({ ok: true });
  expect((await repository.progression.read()).attempts).toHaveLength(1);
});

test('les promotions et alternatives connues sont évaluées sans exiger la première ligne', async () => {
  const { service } = setup({ ...opening, alternatives: [['d2d4', 'd7d5', 'c2c4']] });
  service.start(opening.id);
  service.play('d2d4');
  expect(service.snapshot()).toMatchObject({ ply: 2, errorCount: 0 });
  service.play('c2c4');
  expect(await service.finish()).toMatchObject({ attempt: { outcome: 'success' } });
  const promotion = setup({
    ...opening,
    kind: 'endgame',
    fen: '7k/P7/7K/8/8/8/8/8 w - - 0 1',
    moves: ['a7a8q'],
    alternatives: [['a7a8r']],
    goal: 'promote',
  });
  promotion.service.start(opening.id);
  promotion.service.play('a7a8');
  expect(promotion.service.snapshot()?.feedback).toBe('illegal');
  promotion.service.play('a7a8r');
  expect(await promotion.service.finish()).toMatchObject({
    attempt: { outcome: 'success' },
    review: null,
  });
});

test('les gardes refusent une session absente, un résultat incomplet et un mauvais camp tactique', async () => {
  const { service } = setup();
  expect(service.play('e2e4')).toEqual({ ok: false, reason: 'not-started' });
  expect(await service.finish()).toEqual({ ok: false, reason: 'not-started' });
  expect(service.start('absent')).toEqual({ ok: false, reason: 'unknown-content' });
  service.start(opening.id);
  expect(await service.finish()).toEqual({ ok: false, reason: 'unfinished' });
  const puzzle = setup({ ...opening, kind: 'puzzle' });
  expect(puzzle.service.start(opening.id, 'b')).toEqual({ ok: false, reason: 'wrong-color' });
});
