import * as R from 'remeda';
import type { EngineEvaluation } from '../adapters/engine/engine-types';
import type { AnalysisRecord } from './analysis-types';
import type { GameRecord } from '../game/game-types';
import type {
  AnalysisDependencies,
  AnalysisErrorCode,
  AnalysisService,
  AnalysisView,
  MoveAssessment,
  AnalysisMatePosition,
} from './analysis-types';
export class AnalysisError extends Error {
  constructor(readonly code: AnalysisErrorCode) {
    super(code);
    this.name = 'AnalysisError';
  }
}

export const createAnalysisService = ({
  data,
  repository,
  rules,
  engine,
}: AnalysisDependencies): AnalysisService => {
  return {
    analyze: async (gameId, options = {}) => {
      if (data.read().controller) {
        throw new AnalysisError('busy');
      }
      const token = data.update(R.set('generation', data.read().generation + 1)).generation;
      const current = new AbortController();
      data.update(R.set('controller', current));

      const onAbort = () => {
        return current.abort();
      };

      if (options.signal?.aborted) {
        current.abort();
      }
      options.signal?.addEventListener('abort', onAbort, { once: true });

      const isCurrent = () => {
        return token === data.read().generation && !current.signal.aborted;
      };

      try {
        const saved = await repository.load(gameId);
        const game = saved.game;
        if (!game) {
          throw new AnalysisError('game-not-found');
        }
        if (!game.finishedAt) {
          throw new AnalysisError('game-not-finished');
        }
        let record: AnalysisRecord = saved.record ?? { gameId, positions: [], complete: false };
        if (
          record.gameId !== gameId ||
          record.positions.length > game.moves.length + 1 ||
          record.positions.some((position, index) => position.ply !== index) ||
          (record.complete && record.positions.length !== game.moves.length + 1)
        ) {
          throw new AnalysisError('invalid-checkpoint');
        }
        for (let ply = record.positions.length; ply <= game.moves.length; ply++) {
          let evaluation: EngineEvaluation;
          if (!isCurrent()) {
            break;
          }
          const position = rules.position(undefined, game.moves.slice(0, ply));
          try {
            evaluation =
              position.result === '1/2-1/2'
                ? { bestMove: null, score: { type: 'cp', value: 0 }, pv: [] }
                : await engine.evaluate(
                    position.fen,
                    { level: 'club', movetime: 250 },
                    current.signal,
                  );
          } catch {
            if (!isCurrent()) {
              break;
            }
            throw new AnalysisError('engine-error');
          }
          if (!isCurrent()) {
            break;
          }
          const nextRecord: AnalysisRecord = {
            gameId,
            complete: ply === game.moves.length,
            positions: R.concat(record.positions, [
              {
                ply,
                fen: position.fen,
                bestMove: evaluation.bestMove,
                score: R.set(
                  evaluation.score,
                  'value',
                  position.turn === 'w' ? evaluation.score.value : -evaluation.score.value,
                ),
                pv: [...evaluation.pv],
              },
            ]),
          };
          const checkpoint = await repository.saveCheckpoint(nextRecord, isCurrent);
          record = checkpoint ?? record;
          if (!isCurrent()) {
            break;
          }
          options.onProgress?.(view(record, game));
        }
        return view(record, game);
      } finally {
        options.signal?.removeEventListener('abort', onAbort);
        if (token === data.read().generation) {
          data.update(R.set('controller', null));
        }
      }
    },

    get: async (gameId) => {
      const { game, record } = await repository.load(gameId);
      return game && record ? view(record, game) : null;
    },

    cancel: async () => {
      if (!data.read().controller) {
        return;
      }
      data.update(R.set('generation', data.read().generation + 1));
      const cancelled = data.read().controller!;
      cancelled.abort();
      // A failed physical stop retains the guard so Retry must contact the engine again.
      await engine.cancel();
      if (data.read().controller === cancelled) {
        data.update(R.set('controller', null));
      }
    },
  };
};

const view = (record: AnalysisRecord, game: GameRecord): AnalysisView => {
  return {
    record: R.set(
      record,
      'positions',
      R.map(record.positions, (position) =>
        R.pipe(position, R.set('score', { ...position.score }), R.set('pv', [...position.pv])),
      ),
    ),
    assessments: assessments(record, game),
    totalPositions: game.moves.length + 1,
  };
};

const assessments = (record: AnalysisRecord, game: GameRecord): readonly MoveAssessment[] => {
  const positions = new Map(R.map(record.positions, (position) => [position.ply, position]));
  return R.flatMap(game.moves, (move, index): readonly MoveAssessment[] => {
    const before = positions.get(index);
    const after = positions.get(index + 1);
    if (!before || !after) {
      return [];
    }
    const mover = index % 2 === 0 ? 1 : -1;
    if (before.score.type === 'mate' || after.score.type === 'mate') {
      const ownMateBefore = before.score.type === 'mate' && mateWinner(before) === mover;
      const ownMateAfter = after.score.type === 'mate' && mateWinner(after) === mover;
      const lostMate = ownMateBefore && !ownMateAfter;
      const allowsMate =
        after.score.type === 'mate' &&
        mateWinner(after) !== mover &&
        !(before.score.type === 'mate' && mateWinner(before) !== mover);
      return [
        {
          ply: index + 1,
          move,
          loss: null,
          quality: lostMate ? 'missed-mate' : allowsMate ? 'allows-mate' : 'good',
        },
      ];
    }
    const loss = Math.max(0, (before.score.value - after.score.value) * mover);
    return [
      {
        ply: index + 1,
        move,
        loss,
        quality:
          loss >= 200 ? 'blunder' : loss >= 100 ? 'mistake' : loss >= 50 ? 'inaccuracy' : 'good',
      },
    ];
  });
};

export const mateWinner = (position: AnalysisMatePosition): number => {
  return position.score.value === 0
    ? position.fen.split(' ')[1] === 'w'
      ? -1
      : 1
    : Math.sign(position.score.value);
};
