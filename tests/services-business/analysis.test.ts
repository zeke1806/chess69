import { expect, test } from '@jest/globals';
import { createChessJsRulesService } from '../../src/services-business/adapters/rules/chess-js-rules-service';
import { createEmptyState } from '../../src/services-business/adapters/repository/repository-types';
import { createMemoryRepositoryService } from '../../src/services-business/adapters/repository/repository-service';
import type {
  AnalysisRecord,
  AnalysisRepository,
} from '../../src/services-business/analysis/analysis-types';
import type { GameRecord } from '../../src/services-business/game/game-types';
import type { EngineService } from '../../src/services-business/adapters/engine/engine-types';
import { createAnalysisService } from '../../src/services-business/analysis/analysis-service';

const setup = (
  engine: EngineService,
  checkpoint?: AnalysisRecord,
  gameOverrides: Partial<GameRecord> = {},
) => {
  let state = {
    ...createEmptyState(),
    games: [
      {
        id: 'game',
        color: 'w',
        level: 'club',
        moves: ['e2e4', 'e7e5'],
        startedAt: '2026-10-13T12:00:00Z',
        finishedAt: '2026-10-13T12:01:00Z',
        result: '0-1',
        day: '2026-10-13',
        ...gameOverrides,
      },
    ],
  } as ReturnType<typeof createEmptyState>;
  if (checkpoint) {
    state = { ...state, analyses: { game: checkpoint } };
  }
  let failure = false;
  let beforeWrite: (() => Promise<void>) | null = null;
  const repository = createMemoryRepositoryService({ initialState: state });
  void repository.initialize();
  const analysisRepository: AnalysisRepository = {
    ...repository.analysis,

    saveCheckpoint: async (...args) => {
      const wait = beforeWrite;
      beforeWrite = null;
      await wait?.();
      if (failure) {
        throw new Error('storage unavailable');
      }
      return repository.analysis.saveCheckpoint(...args);
    },
  };
  const dependencies = {
    repository: analysisRepository,
    engine,
    rules: createChessJsRulesService(),
  };
  return {
    analysis: createAnalysisService(dependencies),

    restart: () => {
      return createAnalysisService(dependencies);
    },

    fail: (value: boolean) => {
      failure = value;
    },

    repository,

    holdWrite: () => {
      let began!: () => void;
      let release!: () => void;
      const started = new Promise<void>((resolve) => {
        began = resolve;
      });
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      beforeWrite = async () => {
        began();
        await pending;
      };
      return { started, release };
    },
  };
};

test('analysis stores each position including the final one and converts scores to White', async () => {
  const scores = [50, 70, 10];
  const { analysis, restart } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      return { bestMove: 'g1f3', score: { type: 'cp', value: scores.shift() ?? 0 }, pv: ['g1f3'] };
    },
  });
  const progress: number[] = [];
  const complete = await analysis.analyze('game', {
    onProgress: (view) => {
      progress.push(view.record.positions.length);
    },
  });
  expect(complete.record.complete).toBe(true);
  expect(complete.totalPositions).toBe(3);
  expect(complete.record.positions.map((position) => [position.ply, position.score.value])).toEqual(
    [
      [0, 50],
      [1, -70],
      [2, 10],
    ],
  );
  expect(complete.assessments).toEqual([
    { ply: 1, move: 'e2e4', loss: 120, quality: 'mistake' },
    { ply: 2, move: 'e7e5', loss: 80, quality: 'inaccuracy' },
  ]);
  expect(progress).toEqual([1, 2, 3]);
  expect((await restart().get('game'))?.record).toEqual(complete.record);
});

test('cancelled analysis keeps checkpoints, discards a late reply, and resumes without duplicates', async () => {
  let release!: () => void;
  let began!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const beganPending = new Promise<void>((resolve) => {
    began = resolve;
  });
  let first = true;
  const { analysis, restart } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      if (first) {
        first = false;
        return { bestMove: 'e2e4', score: { type: 'cp', value: 20 }, pv: ['e2e4'] };
      }
      began();
      await pending;
      return { bestMove: 'g1f3', score: { type: 'cp', value: 10 }, pv: ['g1f3'] };
    },
  });
  const work = analysis.analyze('game');
  await beganPending;
  await analysis.cancel();
  release();
  const partial = await work;
  expect(partial.record).toMatchObject({
    complete: false,
    positions: [expect.objectContaining({ ply: 0 })],
  });
  expect((await restart().get('game'))?.record.positions).toHaveLength(1);
  const resumed = await restart().analyze('game');
  expect(resumed.record.complete).toBe(true);
  expect(resumed.record.positions.map((position) => position.ply)).toEqual([0, 1, 2]);
});

test('AbortSignal cancels native work without publishing or retaining its late evaluation', async () => {
  let began!: () => void;
  const waiting = new Promise<void>((resolve) => {
    began = resolve;
  });
  const { analysis } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async (_fen, _options, signal) => {
      began();
      await new Promise<void>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      });
      return { bestMove: null, score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  const controller = new AbortController();
  const work = analysis.analyze('game', { signal: controller.signal });
  await waiting;
  controller.abort();
  expect((await work).record.positions).toEqual([]);
  expect(await analysis.get('game')).toBeNull();
});

test('mate announcements stay distinct from centipawns and classify lost or allowed mates', async () => {
  const scores = [
    { type: 'mate' as const, value: 3 },
    { type: 'cp' as const, value: -100 },
    { type: 'mate' as const, value: 2 },
  ];
  const { analysis } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      return { bestMove: 'g1f3', score: scores.shift() ?? { type: 'cp', value: 0 }, pv: [] };
    },
  });
  const result = await analysis.analyze('game');
  expect(result.record.positions.map((position) => position.score)).toEqual([
    { type: 'mate', value: 3 },
    { type: 'cp', value: 100 },
    { type: 'mate', value: 2 },
  ]);
  expect(result.assessments).toEqual([
    { ply: 1, move: 'e2e4', loss: null, quality: 'missed-mate' },
    { ply: 2, move: 'e7e5', loss: null, quality: 'allows-mate' },
  ]);
});

test('only completed games are analyzed and concurrent requests receive a recoverable error', async () => {
  let began!: () => void;
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    began = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { analysis, repository } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      began();
      await pending;
      return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await expect(analysis.analyze('missing')).rejects.toMatchObject({ code: 'game-not-found' });
  const unfinished = setup(
    {
      initialize: async () => {},

      dispose: async () => {},

      cancel: async () => {},

      evaluate: async () => {
        throw new Error('une partie active ne consulte pas le moteur');
      },
    },
    undefined,
    { finishedAt: null, result: null },
  );
  await expect(unfinished.analysis.analyze('game')).rejects.toMatchObject({
    code: 'game-not-finished',
  });
  const work = analysis.analyze('game');
  await waiting;
  await expect(analysis.analyze('game')).rejects.toMatchObject({ code: 'busy' });
  await analysis.cancel();
  release();
  await work;
});

test('a checkpoint cancelled before its queued write is never announced as saved', async () => {
  const { analysis, holdWrite } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  const held = holdWrite();
  const announced: number[] = [];
  const work = analysis.analyze('game', {
    onProgress: (view) => {
      announced.push(view.record.positions.length);
    },
  });
  await held.started;
  await analysis.cancel();
  held.release();
  expect((await work).record.positions).toEqual([]);
  expect(await analysis.get('game')).toBeNull();
  expect(announced).toEqual([]);
});

test('a failed write retains only saved checkpoints and can resume after retry', async () => {
  const { analysis, restart, fail } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  const progress: number[] = [];
  await expect(
    analysis.analyze('game', {
      onProgress: (view) => {
        progress.push(view.record.positions.length);
        fail(true);
      },
    }),
  ).rejects.toThrow('storage unavailable');
  expect(progress).toEqual([1]);
  expect((await restart().get('game'))?.record.positions).toHaveLength(1);
  fail(false);
  expect(
    (await restart().analyze('game')).record.positions.map((position) => position.ply),
  ).toEqual([0, 1, 2]);
});

test('inconsistent checkpoints are reported without overwriting their saved evidence', async () => {
  const fen = createChessJsRulesService().position().fen;
  const checkpoint: AnalysisRecord = {
    gameId: 'game',
    complete: false,
    positions: [{ ply: 2, fen, bestMove: null, score: { type: 'cp', value: 0 }, pv: [] }],
  };
  const { analysis } = setup(
    {
      initialize: async () => {},

      dispose: async () => {},

      cancel: async () => {},

      evaluate: async () => {
        return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
      },
    },
    checkpoint,
  );
  await expect(analysis.analyze('game')).rejects.toMatchObject({ code: 'invalid-checkpoint' });
  expect((await analysis.get('game'))?.record).toEqual(checkpoint);
});

test.each([
  [49, 'good'],
  [50, 'inaccuracy'],
  [99, 'inaccuracy'],
  [100, 'mistake'],
  [199, 'mistake'],
  [200, 'blunder'],
])('centipawn loss %s has documented quality %s', async (loss, quality) => {
  const values = [100, loss - 100, 0];
  const { analysis } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      return { bestMove: 'e2e4', score: { type: 'cp', value: values.shift() ?? 0 }, pv: [] };
    },
  });
  expect((await analysis.analyze('game')).assessments[0]).toMatchObject({ loss, quality });
});

test('a final checkmate with mate zero still identifies the winner from the position', async () => {
  const scores = [
    { type: 'cp' as const, value: 0 },
    { type: 'cp' as const, value: 0 },
    { type: 'cp' as const, value: 0 },
    { type: 'mate' as const, value: 1 },
    { type: 'mate' as const, value: 0 },
  ];
  const { analysis, repository } = setup(
    {
      initialize: async () => {},

      dispose: async () => {},

      cancel: async () => {},

      evaluate: async () => {
        return {
          bestMove: scores.length === 1 ? null : 'e2e4',
          score: scores.shift() ?? { type: 'cp', value: 0 },
          pv: [],
        };
      },
    },
    undefined,
    { moves: ['f2f3', 'e7e5', 'g2g4', 'd8h4'] },
  );
  const result = await analysis.analyze('game');
  expect(result.record.positions.at(-1)?.score).toMatchObject({ type: 'mate', value: 0 });
  expect(result.assessments.at(-1)).toMatchObject({ ply: 4, quality: 'good', loss: null });
});

test('a native engine failure preserves progress and releases the analysis for retry', async () => {
  let first = true;
  let unavailable = true;
  const { analysis, restart } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {},

    evaluate: async () => {
      if (!first && unavailable) {
        throw new Error('native failure');
      }
      first = false;
      return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  await expect(analysis.analyze('game')).rejects.toMatchObject({ code: 'engine-error' });
  expect((await restart().get('game'))?.record.positions).toHaveLength(1);
  unavailable = false;
  expect((await analysis.analyze('game')).record.complete).toBe(true);
});

test('new analysis stays blocked until native cancellation has completed', async () => {
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
  const { analysis } = setup({
    initialize: async () => {},

    dispose: async () => {},

    cancel: async () => {
      await cancellation;
    },

    evaluate: async () => {
      beginEvaluation();
      await evaluation;
      return { bestMove: 'e2e4', score: { type: 'cp', value: 0 }, pv: [] };
    },
  });
  const work = analysis.analyze('game');
  await began;
  const cancel = analysis.cancel();
  await expect(analysis.analyze('game')).rejects.toMatchObject({ code: 'busy' });
  releaseCancellation();
  await cancel;
  releaseEvaluation();
  await work;
  expect((await analysis.analyze('game')).record.complete).toBe(true);
});

test('a draw by threefold repetition has a final zero score without requesting engine analysis', async () => {
  const moves = ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'];
  const finalPosition = createChessJsRulesService().position(undefined, moves);
  expect(finalPosition.result).toBe('1/2-1/2');
  const { analysis, restart, repository } = setup(
    {
      initialize: async () => {},

      dispose: async () => {},

      cancel: async () => {},

      evaluate: async (fen) => {
        if (fen === finalPosition.fen) {
          throw new Error('A terminal draw must not request a history-free engine evaluation');
        }
        return { bestMove: 'd2d4', score: { type: 'cp', value: 300 }, pv: ['d2d4'] };
      },
    },
    undefined,
    { moves, result: '1/2-1/2' },
  );
  const result = await analysis.analyze('game');
  expect(result.record.complete).toBe(true);
  expect(result.record.positions.at(-1)).toMatchObject({
    ply: 8,
    fen: finalPosition.fen,
    score: { type: 'cp', value: 0 },
    bestMove: null,
    pv: [],
  });
  expect((await restart().get('game'))?.record.positions.at(-1)).toEqual(
    result.record.positions.at(-1),
  );
});
