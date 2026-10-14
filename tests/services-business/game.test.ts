import { expect, test } from '@jest/globals';
import { createChessJsRulesService } from '../../src/services-business/adapters/rules/chess-js-rules-service';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';
import type { GameRepository } from '../../src/services-business/game/game-types';
import type { EngineService } from '../../src/services-business/adapters/engine/engine-types';
import { createGameService } from '../../src/services-business/game/game-service';

const setup = (engine?: EngineService) => {
  const repository = createMemoryRepositoryService();
  void repository.initialize();
  let failure = false;
  let id = 0;
  const gameRepository: GameRepository = {
    ...repository.game,
    start: async (input) => {
      if (failure) {
        throw new Error('storage unavailable');
      }
      return repository.game.start(input);
    },
    save: async (...args) => {
      if (failure) {
        throw new Error('storage unavailable');
      }
      return repository.game.save(...args);
    },
  };
  const dependencies = {
    repository: gameRepository,
    rules: createChessJsRulesService(),
    engine: engine ?? {
      initialize: async () => {},
      evaluate: async () => {
        return { bestMove: 'e7e5', score: { type: 'cp' as const, value: 0 }, pv: ['e7e5'] };
      },
      cancel: async () => {},
      dispose: async () => {},
    },
    clock: {
      now: () => {
        return new Date('2026-10-13T12:00:00Z');
      },
    },
    ids: {
      id: () => {
        return `game-${++id}`;
      },
      random: () => {
        return 0.8;
      },
    },
  };
  return {
    game: createGameService(dependencies),
    restart: () => {
      return createGameService(dependencies);
    },
    fail: (value: boolean) => {
      failure = value;
    },
    repository,
  };
};

test('a player move is persisted and a fresh service resumes the position', async () => {
  const { game, restart } = setup();
  const started = await game.start({ color: 'w', level: 'casual' });
  expect(started.record.id).toBe('game-1');
  const moved = await game.play('e2e4');
  expect(moved.position.history).toEqual(['e4']);
  expect((await restart().resume())?.record.moves).toEqual(['e2e4']);
});

test('replacing an active game requires confirmation and stores its resignation', async () => {
  const { game } = setup();
  await game.start({ color: 'w', level: 'beginner' });
  await expect(game.start({ color: 'b', level: 'club' })).rejects.toMatchObject({
    code: 'replacement-required',
  });
  expect((await game.resume())?.record.id).toBe('game-1');
  const replacement = await game.start({ color: 'random', level: 'club' }, true);
  expect(replacement.record.color).toBe('b');
  expect(await game.history()).toEqual([
    expect.objectContaining({
      record: expect.objectContaining({
        id: 'game-1',
        result: '0-1',
        finishedAt: '2026-10-13T12:00:00.000Z',
      }),
    }),
  ]);
});

test('the engine reply can complete a game and the result survives reopening', async () => {
  const replies = ['e7e5', 'd8h4'];
  const engine: EngineService = {
    initialize: async () => {},
    dispose: async () => {},
    cancel: async () => {},
    evaluate: async () => {
      return { bestMove: replies.shift() ?? null, score: { type: 'cp', value: 0 }, pv: [] };
    },
  };
  const { game, restart } = setup(engine);
  await game.start({ color: 'w', level: 'club' });
  await game.play('f2f3');
  await game.think();
  await game.play('g2g4');
  const ended = await game.think();
  expect(ended?.record.result).toBe('0-1');
  expect(ended?.position.endReason).toBe('checkmate');
  expect(await restart().resume()).toBeNull();
  expect((await restart().history())[0]?.record.moves).toEqual(['f2f3', 'e7e5', 'g2g4', 'd8h4']);
});

test('a player checkmate is stored once and no active game remains', async () => {
  const replies = ['f2f3', 'g2g4'];
  const { game } = setup({
    initialize: async () => {},
    dispose: async () => {},
    cancel: async () => {},
    evaluate: async () => {
      return { bestMove: replies.shift() ?? null, score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await game.start({ color: 'b', level: 'beginner' });
  await game.think();
  await game.play('e7e5');
  await game.think();
  const ended = await game.play('d8h4');
  expect(ended.record.result).toBe('0-1');
  expect(await game.resume()).toBeNull();
  await expect(game.resign()).rejects.toMatchObject({ code: 'no-active-game' });
  expect(await game.history()).toHaveLength(1);
});

test('concurrent actions cannot create duplicate games or silently overwrite a move', async () => {
  const { game } = setup();
  const starts = await Promise.allSettled([
    game.start({ color: 'w', level: 'club' }),
    game.start({ color: 'b', level: 'club' }),
  ]);
  expect(starts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(starts.find((result) => result.status === 'rejected')).toMatchObject({
    reason: { code: 'busy' },
  });
  const plays = await Promise.allSettled([game.play('e2e4'), game.play('d2d4')]);
  expect(plays.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect((await game.resume())?.record.moves).toEqual(['e2e4']);
});

test('cancelling a thinking engine rejects duplicate actions and discards late replies', async () => {
  let release!: () => void;
  let began!: () => void;
  const started = new Promise<void>((resolve) => {
    began = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { game } = setup({
    initialize: async () => {},
    dispose: async () => {},
    cancel: async () => {},
    evaluate: async () => {
      began();
      await pending;
      return { bestMove: 'e7e5', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await game.start({ color: 'w', level: 'club' });
  await game.play('e2e4');
  const thinking = game.think();
  await started;
  await expect(game.think()).rejects.toMatchObject({ code: 'busy' });
  await expect(game.start({ color: 'w', level: 'club' }, true)).rejects.toMatchObject({
    code: 'busy',
  });
  await game.cancelThinking();
  const replacement = await game.start({ color: 'w', level: 'club' }, true);
  release();
  expect(await thinking).toBeNull();
  expect((await game.resume())?.record.id).toBe(replacement.record.id);
  expect((await game.resume())?.record.moves).toEqual([]);
});

test('separate service instances cannot both start an active game from the same state', async () => {
  const { game, restart } = setup();
  const starts = await Promise.allSettled([
    game.start({ color: 'w', level: 'club' }),
    restart().start({ color: 'b', level: 'club' }),
  ]);
  expect(starts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(starts.find((result) => result.status === 'rejected')).toMatchObject({
    reason: { code: 'conflict' },
  });
});

test('storage failure never announces a saved move and allows a safe retry', async () => {
  const { game, fail, restart } = setup();
  await game.start({ color: 'w', level: 'club' });
  fail(true);
  await expect(game.play('e2e4')).rejects.toThrow('storage unavailable');
  expect((await restart().resume())?.record.moves).toEqual([]);
  fail(false);
  expect((await game.play('e2e4')).record.moves).toEqual(['e2e4']);
});

test('an illegal engine response leaves the player move available for retry', async () => {
  let bestMove = 'e7e8q';
  const { game } = setup({
    initialize: async () => {},
    dispose: async () => {},
    cancel: async () => {},
    evaluate: async () => {
      return { bestMove, score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await game.start({ color: 'w', level: 'club' });
  await expect(game.play('e2e5')).rejects.toMatchObject({ code: 'illegal-move' });
  await game.play('e2e4');
  await expect(game.play('d2d4')).rejects.toMatchObject({ code: 'not-player-turn' });
  await expect(game.think()).rejects.toMatchObject({ code: 'engine-error' });
  expect((await game.resume())?.record.moves).toEqual(['e2e4']);
  bestMove = 'e7e5';
  expect((await game.think())?.record.moves).toEqual(['e2e4', 'e7e5']);
  expect((await game.resign()).record.result).toBe('0-1');
});

test('new game work stays blocked until native cancellation has completed', async () => {
  let beginEvaluation!: () => void;
  let releaseEvaluation!: () => void;
  let releaseCancellation!: () => void;
  const began = new Promise<void>((resolve) => {
    beginEvaluation = resolve;
  });
  const evaluation = new Promise<void>((resolve) => {
    releaseEvaluation = resolve;
  });
  const cancellation = new Promise<void>((resolve) => {
    releaseCancellation = resolve;
  });
  const { game } = setup({
    initialize: async () => {},
    dispose: async () => {},
    cancel: async () => {
      await cancellation;
    },
    evaluate: async () => {
      beginEvaluation();
      await evaluation;
      return { bestMove: 'e7e5', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await game.start({ color: 'w', level: 'club' });
  await game.play('e2e4');
  const thinking = game.think();
  await began;
  const cancel = game.cancelThinking();
  await expect(game.start({ color: 'w', level: 'club' }, true)).rejects.toMatchObject({
    code: 'busy',
  });
  releaseCancellation();
  await cancel;
  releaseEvaluation();
  await thinking;
  expect((await game.start({ color: 'w', level: 'club' }, true)).record.moves).toEqual([]);
});
