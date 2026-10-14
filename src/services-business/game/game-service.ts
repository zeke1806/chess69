import * as R from 'remeda';
import { localDay } from '../calendar/calendar-service';
import type { GameRecord } from './game-types';
import type { GameDependencies, GameErrorCode, GameService, GameSession } from './game-types';
export class GameError extends Error {
  constructor(readonly code: GameErrorCode) {
    super(code);
    this.name = 'GameError';
  }
}

export const createGameService = ({
  repository,
  rules,
  clock,
  ids,
  engine,
}: GameDependencies): GameService => {
  let busy = false;
  let generation = 0;
  let thinking: AbortController | null = null;
  return {
    start: (options, replaceConfirmed = false) => {
      return mutate(async () => {
        const old = await repository.active();
        if (old && !replaceConfirmed) {
          throw new GameError('replacement-required');
        }
        const now = clock.now();
        const record: GameRecord = {
          id: ids.id(),
          color: options.color === 'random' ? (ids.random() < 0.5 ? 'w' : 'b') : options.color,
          level: options.level,
          moves: [],
          startedAt: now.toISOString(),
          finishedAt: null,
          result: null,
          day: null,
        };
        const accepted = await repository.start({
          record,
          options,
          expectedActiveId: old?.id ?? null,
          replaced: old ? finish(old, old.color === 'w' ? '0-1' : '1-0', now) : null,
        });
        if (!accepted) {
          throw new GameError('conflict');
        }
        return session(record);
      });
    },

    resume: async () => {
      const record = await repository.active();
      return record ? session(record) : null;
    },

    play: (uci) => {
      return mutate(async () => {
        const record = await active();
        if (rules.position(undefined, record.moves).turn !== record.color) {
          throw new GameError('not-player-turn');
        }
        const next = rules.play(undefined, record.moves, uci);
        if (!next) {
          throw new GameError('illegal-move');
        }
        const moved = R.set(record, 'moves', R.concat(record.moves, [uci]));
        const updated = next.result ? finish(moved, next.result, clock.now()) : moved;
        await save(record, updated);
        return session(updated);
      });
    },

    think: async () => {
      if (busy || thinking) {
        throw new GameError('busy');
      }
      const token = ++generation;
      const controller = new AbortController();

      const isCurrent = () => {
        return token === generation && !controller.signal.aborted;
      };

      thinking = controller;
      try {
        let bestMove: string | null;
        const record = await active();
        if (!isCurrent()) {
          return null;
        }
        const position = rules.position(undefined, record.moves);
        if (position.turn === record.color) {
          throw new GameError('not-engine-turn');
        }
        try {
          bestMove = (
            await engine.evaluate(
              position.fen,
              { level: record.level, movetime: 500 },
              controller.signal,
            )
          ).bestMove;
        } catch {
          if (!isCurrent()) {
            return null;
          }
          throw new GameError('engine-error');
        }
        if (!isCurrent()) {
          return null;
        }
        const next = bestMove ? rules.play(undefined, record.moves, bestMove) : null;
        if (!bestMove || !next) {
          throw new GameError('engine-error');
        }
        const moved = R.set(record, 'moves', R.concat(record.moves, [bestMove]));
        const updated = next.result ? finish(moved, next.result, clock.now()) : moved;
        await save(record, updated, isCurrent);
        return isCurrent() ? session(updated) : null;
      } finally {
        if (token === generation) {
          thinking = null;
        }
      }
    },

    cancelThinking: async () => {
      if (!thinking) {
        return;
      }
      ++generation;
      const cancelled = thinking;
      cancelled.abort();
      // A failed physical stop retains the guard so Retry must contact the engine again.
      await engine.cancel();
      if (thinking === cancelled) {
        thinking = null;
      }
    },

    resign: () => {
      return mutate(async () => {
        const record = await active();
        const updated = finish(record, record.color === 'w' ? '0-1' : '1-0', clock.now());
        await save(record, updated);
        return session(updated);
      });
    },

    history: async () => {
      return R.map(await repository.history(), session);
    },

    get: async (id) => {
      const record = await repository.get(id);
      return record ? session(record) : null;
    },
  };

  async function mutate<T>(action: () => Promise<T>): Promise<T> {
    if (busy || thinking) {
      throw new GameError('busy');
    }
    busy = true;
    try {
      return await action();
    } finally {
      busy = false;
    }
  }

  function session(record: GameRecord): GameSession {
    return {
      record: R.set(record, 'moves', [...record.moves]),
      position: rules.position(undefined, record.moves),
    };
  }

  async function active(): Promise<GameRecord> {
    const record = await repository.active();
    if (!record) {
      throw new GameError('no-active-game');
    }
    return record;
  }

  async function save(
    record: GameRecord,
    updated: GameRecord,
    isCurrent = () => {
      return true;
    },
  ): Promise<void> {
    const accepted = await repository.save(record, updated, isCurrent);
    if (!accepted && isCurrent()) {
      throw new GameError('conflict');
    }
  }
};

const finish = (record: GameRecord, result: string, now: Date): GameRecord => {
  return R.merge(record, {
    result,
    finishedAt: now.toISOString(),
    day: localDay(now),
  });
};
